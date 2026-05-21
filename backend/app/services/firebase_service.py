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

    def _initialize_firebase(self):
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if not cred_path:
            logger.warning(
                "⚠️ FIREBASE_CREDENTIALS_PATH is not set in environment. "
                "Firebase service is running in mock/unconfigured mode. Database operations will fail gracefully."
            )
            return

        if not os.path.exists(cred_path):
            logger.warning(
                f"⚠️ Firebase credential file not found at: {os.path.abspath(cred_path)}. "
                "Firebase service is running in mock/unconfigured mode."
            )
            return

        try:
            # Initialize official firebase SDK
            cred = credentials.Certificate(cred_path)
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

    def create_session(self, session_id: str, filename: str, data_info: dict, base64_plots: dict) -> None:
        """Create a new session in Firestore with metadata and pre-generated Base64 plots."""
        self._check_db_ready()
        
        session_ref = self.db.collection("sessions").document(session_id)
        session_data = {
            "session_id": session_id,
            "filename": filename,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "data_info": json.dumps(data_info, default=str),
            "plots": base64_plots  # dict of plot_name -> base64_string
        }
        session_ref.set(session_data)
        logger.info(f"Created Firestore session {session_id} for file {filename}")

    def get_session_data_info(self, session_id: str) -> dict:
        """Retrieve dataset summary metadata JSON for a session."""
        self._check_db_ready()
        
        doc = self.db.collection("sessions").document(session_id).get()
        if not doc.exists:
            raise KeyError(f"Session '{session_id}' not found.")
        
        data = doc.to_dict()
        return json.loads(data.get("data_info", "{}"))

    def get_session_plots(self, session_id: str) -> dict:
        """Retrieve pre-generated Base64 visual plot strings for a session."""
        self._check_db_ready()
        
        doc = self.db.collection("sessions").document(session_id).get()
        if not doc.exists:
            raise KeyError(f"Session '{session_id}' not found.")
        
        data = doc.to_dict()
        return data.get("plots", {})

    def get_chat_history(self, session_id: str) -> list:
        """
        Retrieve ordered conversation logs for a session.
        Returns a list of dicts: [{"role": "human"|"assistant", "content": "..."}]
        """
        self._check_db_ready()
        
        messages_ref = self.db.collection("sessions").document(session_id).collection("messages")
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

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Append a message (human or assistant) to the session's chat log in Firestore."""
        self._check_db_ready()
        
        messages_ref = self.db.collection("sessions").document(session_id).collection("messages")
        message_data = {
            "role": role,
            "content": content,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        messages_ref.add(message_data)
        logger.info(f"Added message by {role} to session {session_id} history")

firebase_service = FirebaseService()
