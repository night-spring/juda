import os
import json
import logging
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings

logger = logging.getLogger("juda.firebase")

class FirebaseNotConfiguredException(Exception):
    """Exception raised when Firebase Firestore calls are made but Firebase is not configured."""
    pass

class FirebaseService:
    def __init__(self):
        self.db = None
        self.is_configured = False
        self._initialize_firebase()
    
    def initialize_cred(self):
        project_id = settings.FIREBASE_PROJECT_ID
        private_key = settings.FIREBASE_PRIVATE_KEY
        client_email = settings.FIREBASE_CLIENT_EMAIL

        cred_dict = {
            "type": "service_account",
            "project_id": project_id,
            "private_key": private_key,
            "client_email": client_email,
            "token_uri": "https://oauth2.googleapis.com/token"
            }
        
        return cred_dict

    def _initialize_firebase(self):
        cred_dict = self.initialize_cred()
        if not cred_dict:
            logger.warning(
                "⚠️ FIREBASE_CREDENTIALS are not set in environment. "
                "Firebase service is running in mock/unconfigured mode. Database operations will fail gracefully."
            )
            return

        try:
            # Initialize official firebase SDK
            cred = credentials.Certificate(cred_dict)
            # Avoid duplicate app initialization error
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            self.is_configured = True
            logger.info("✅ Firebase Firestore initialized successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase SDK: {str(e)}")
            self.db = None
            self.is_configured = False

    def _check_db_ready(self):
        if not self.is_configured or self.db is None:
            raise FirebaseNotConfiguredException(
                "Firebase Firestore is not configured yet. "
                "Please configure FIREBASE_CREDENTIALS_PATH in your .env file with a valid Firebase private key JSON."
            )

    def create_session(self, session_id: str, filename: str, data_info: dict, base64_plots: dict, user_id: str) -> None:
        """Create a new session in Firestore under users/{user_id}/sessions/."""
        self._check_db_ready()
        
        session_ref = self.db.collection("users").document(user_id).collection("sessions").document(session_id)
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "filename": filename,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "data_info": json.dumps(data_info, default=str),
            "plots": base64_plots  # dict of plot_name -> base64_string
        }
        session_ref.set(session_data)
        logger.info(f"Created nested Firestore session {session_id} for file {filename} owned by {user_id}")

    def check_session_ownership(self, session_id: str, user_id: str) -> bool:
        """Verify if a session document exists inside the user's private collection space."""
        self._check_db_ready()
        doc = self.db.collection("users").document(user_id).collection("sessions").document(session_id).get()
        return doc.exists

    def get_session_data_info(self, session_id: str, user_id: str) -> dict:
        """Retrieve dataset summary metadata JSON for a nested session."""
        self._check_db_ready()
        
        doc = self.db.collection("users").document(user_id).collection("sessions").document(session_id).get()
        if not doc.exists:
            raise KeyError(f"Session '{session_id}' not found.")
        
        data = doc.to_dict()
        return json.loads(data.get("data_info", "{}"))

    def get_session_plots(self, session_id: str, user_id: str) -> dict:
        """Retrieve pre-generated Base64 visual plot strings for a nested session."""
        self._check_db_ready()
        
        doc = self.db.collection("users").document(user_id).collection("sessions").document(session_id).get()
        if not doc.exists:
            raise KeyError(f"Session '{session_id}' not found.")
        
        data = doc.to_dict()
        return data.get("plots", {})

    def get_chat_history(self, session_id: str, user_id: str) -> list:
        """
        Retrieve ordered conversation logs for a nested session.
        Returns a list of dicts: [{"role": "human"|"assistant", "content": "..."}]
        """
        self._check_db_ready()
        
        messages_ref = self.db.collection("users").document(user_id).collection("sessions").document(session_id).collection("messages")
        # Order by timestamp field
        query = messages_ref.order_by("timestamp", direction=firestore.Query.ASCENDING).stream()
        
        history = []
        for doc in query:
            msg = doc.to_dict()
            history.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })
        return history

    def add_message(self, session_id: str, role: str, content: str, user_id: str) -> None:
        """Append a message (human or assistant) to the nested session's chat log in Firestore."""
        self._check_db_ready()
        
        messages_ref = self.db.collection("users").document(user_id).collection("sessions").document(session_id).collection("messages")
        message_data = {
            "role": role,
            "content": content,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        messages_ref.add(message_data)
        logger.info(f"Added message by {role} to nested session {session_id} history")

    def get_all_sessions(self, user_id: str) -> list:
        """Retrieve all sessions stored in Firestore belonging to the given user."""
        self._check_db_ready()
        query = self.db.collection("users").document(user_id).collection("sessions")
        try:
            # Try to order by created_at descending
            docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        except Exception as e:
            logger.warning(f"Could not sort sessions by created_at: {str(e)}. Streaming unordered documents.")
            docs = query.stream()

        sessions = []
        for doc in docs:
            data = doc.to_dict()
            try:
                data_info = json.loads(data.get("data_info", "{}"))
            except Exception:
                data_info = {}
            sessions.append({
                "session_id": data.get("session_id"),
                "filename": data.get("filename"),
                "row_count": data_info.get("row_count", 0),
                "columns": data_info.get("columns", []),
                "created_at": data.get("created_at", "")
            })
        
        # Sort in memory descending if Firestore index sorting wasn't pre-computed or failed
        try:
            sessions.sort(key=lambda s: s.get("created_at", ""), reverse=True)
        except Exception as e:
            logger.warning(f"Failed to sort sessions in-memory: {str(e)}")
            
        return sessions

    def clear_chat_history(self, session_id: str, user_id: str) -> None:
        """Delete all nested chat messages for a nested session, keeping the parent document."""
        self._check_db_ready()
        messages_ref = self.db.collection("users").document(user_id).collection("sessions").document(session_id).collection("messages")
        messages = messages_ref.stream()
        for doc in messages:
            doc.reference.delete()
        logger.info(f"Cleared Firestore nested messages for nested session '{session_id}'.")

    def delete_session(self, session_id: str, user_id: str) -> None:
        """Delete a nested session document and all nested chat message subcollections from Firestore."""
        self._check_db_ready()
        
        # 1. Delete all nested messages first
        messages_ref = self.db.collection("users").document(user_id).collection("sessions").document(session_id).collection("messages")
        messages = messages_ref.stream()
        for doc in messages:
            doc.reference.delete()
            
        # 2. Delete the parent session document itself
        self.db.collection("users").document(user_id).collection("sessions").document(session_id).delete()
        logger.info(f"Deleted Firestore nested session document '{session_id}' and all nested messages.")

firebase_service = FirebaseService()
