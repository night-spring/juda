import os
import io
import uuid
import json
import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.models.eda import UploadResponse, ReportResponse, MetadataResponse, SessionInfoResponse
from app.services.eda_service import eda_service
from app.services.viz_service import viz_service
from app.services.firebase_service import firebase_service, FirebaseNotConfiguredException
from app.services.llm_service import llm_service, GeminiNotConfiguredException
from app.api.deps import get_current_user

logger = logging.getLogger("juda.api.eda")
router = APIRouter(prefix="/eda", tags=["Exploratory Data Analysis"])

# Thread-safe in-memory cache fallback for local mock testing without Firebase
LOCAL_SESSION_CACHE = {}
CACHE_FILE_PATH = "data/local_session_cache.json"

def load_local_session_cache():
    if os.path.exists(CACHE_FILE_PATH):
        try:
            with open(CACHE_FILE_PATH, "r", encoding="utf-8") as f:
                loaded_data = json.load(f)
            
            # Migrate old flat dictionary to new nested user dictionary format
            # Old flat format: { session_id: { "user_id": user_id, ... } }
            # New format: { user_id: { session_id: { ... } } }
            migrated = {}
            for key, val in loaded_data.items():
                if isinstance(val, dict) and "user_id" in val:
                    uid = val.get("user_id", "mock-user-123")
                    if uid not in migrated:
                        migrated[uid] = {}
                    migrated[uid][key] = val
                elif isinstance(val, dict):
                    # Already nested format
                    migrated[key] = val
            
            LOCAL_SESSION_CACHE.clear()
            LOCAL_SESSION_CACHE.update(migrated)
            logger.info(f"✅ Loaded {len(LOCAL_SESSION_CACHE)} users' sessions from local storage.")
        except Exception as e:
            logger.error(f"❌ Failed to load local session cache: {str(e)}")
    else:
        LOCAL_SESSION_CACHE.clear()

def save_local_session_cache():
    try:
        os.makedirs(os.path.dirname(CACHE_FILE_PATH), exist_ok=True)
        with open(CACHE_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(LOCAL_SESSION_CACHE, f, ensure_ascii=False, indent=2)
        logger.info(f"💾 Persisted {len(LOCAL_SESSION_CACHE)} user caches to local cache file.")
    except Exception as e:
        logger.error(f"❌ Failed to save local session cache: {str(e)}")

# Initialize the cache on import
load_local_session_cache()

def check_session_ownership_or_raise(session_id: str, user_id: str):
    """
    Ensure the session exists and is owned by the current user.
    Checks Firestore first if configured, and falls back to local memory cache.
    Raises 404 Not Found if the session is not found in either system or not owned by the user.
    """
    # 1. Try Firebase Firestore check first
    if firebase_service.is_configured:
        try:
            is_owned = firebase_service.check_session_ownership(session_id, user_id)
            if is_owned:
                return
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Session '{session_id}' not found."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Firestore ownership check failed, trying local memory cache: {str(e)}")

    # 2. Check local in-memory cache ownership
    if user_id in LOCAL_SESSION_CACHE and session_id in LOCAL_SESSION_CACHE[user_id]:
        return
            
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Session '{session_id}' not found."
    )

@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Upload a CSV file to process strictly in-memory.
    Generates summary statistics and base64 plots, registering them under a new session.
    The raw CSV data is immediately discarded.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported."
        )

    try:
        # Read file stream
        contents = await file.read()
        file_stream = io.BytesIO(contents)
        
        # Parse & Profile in-memory
        df = eda_service.parse_csv_to_dataframe(file_stream)
        metadata = eda_service.get_data_metadata(df)
        
        # Pre-generate visual plots in-memory as Base64
        plots_base64 = viz_service.generate_all_standard_plots(df)
        
        # Generate session identity
        session_id = str(uuid.uuid4())
        
        # Try to save to Firestore database
        try:
            firebase_service.create_session(
                session_id=session_id,
                filename=file.filename,
                data_info=metadata,
                base64_plots=plots_base64,
                user_id=current_user["uid"]
            )
            using_firebase = True
        except Exception as e:
            # Fallback to local cache for mock trials or database errors
            logger.warning(f"Database fallback activated due to failure/unconfigured: {str(e)}")
            uid = current_user["uid"]
            if uid not in LOCAL_SESSION_CACHE:
                LOCAL_SESSION_CACHE[uid] = {}
            LOCAL_SESSION_CACHE[uid][session_id] = {
                "filename": file.filename,
                "data_info": metadata,
                "plots": plots_base64,
                "messages": []
            }
            save_local_session_cache()
            using_firebase = False

        db_status = "Firebase Firestore" if using_firebase else "Local In-Memory Cache (Mock Mode)"
        return UploadResponse(
            session_id=session_id,
            filename=file.filename,
            row_count=metadata["row_count"],
            columns=metadata["columns"],
            message=f"✅ Data processed successfully! Registered in {db_status}. Raw data has been discarded."
        )
    except Exception as e:
        logger.error(f"Error in upload endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process CSV file: {str(e)}"
        )

@router.get("/summary/{session_id}", response_model=MetadataResponse)
def get_session_summary(session_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve raw parsed JSON data statistics for a session."""
    check_session_ownership_or_raise(session_id, current_user["uid"])
    try:
        # Try Firebase first
        try:
            metadata = firebase_service.get_session_data_info(session_id, current_user["uid"])
        except Exception as e:
            # Fallback
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            uid = current_user["uid"]
            if uid not in LOCAL_SESSION_CACHE or session_id not in LOCAL_SESSION_CACHE[uid]:
                raise KeyError()
            metadata = LOCAL_SESSION_CACHE[uid][session_id]["data_info"]

        return MetadataResponse(
            session_id=session_id,
            columns=metadata["columns"],
            numerical_columns=metadata["numerical_columns"],
            categorical_columns=metadata["categorical_columns"],
            not_useful_columns=metadata["not_useful_columns"],
            row_count=metadata["row_count"],
            col_count=metadata["col_count"],
            summary=metadata["summary"],
            missing_values=metadata["missing_values"],
            duplicates=metadata["duplicates"],
            correlations=metadata["correlations"],
            categorical_summary=metadata["categorical_summary"]
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/report/{session_id}", response_model=ReportResponse)
def generate_eda_report(session_id: str, current_user: dict = Depends(get_current_user)):
    """Use Google Gemini to generate a markdown analytical report from the dataset summary metadata."""
    check_session_ownership_or_raise(session_id, current_user["uid"])
    try:
        # Load metadata
        try:
            metadata = firebase_service.get_session_data_info(session_id, current_user["uid"])
        except Exception as e:
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            uid = current_user["uid"]
            if uid not in LOCAL_SESSION_CACHE or session_id not in LOCAL_SESSION_CACHE[uid]:
                raise KeyError()
            metadata = LOCAL_SESSION_CACHE[uid][session_id]["data_info"]

        metadata_str = json.dumps(metadata, indent=4, default=str)
        
        # Invoke Gemini via LLM Service
        try:
            report_content = llm_service.generate_eda_report(metadata_str)
        except Exception as e:
            logger.warning(f"LLM fallback activated due to failure/unconfigured: {str(e)}")
            # Helpful mockup response so it doesn't break testing
            report_content = f"""# 📊 Exploratory Data Analysis Report (Mock Mode)

> ⚠️ **Google Gemini API is not configured or failed.** This is a mockup report generated from your dataset statistics.

## 📈 Dataset Overview
- **Number of Records**: {metadata['row_count']}
- **Number of Fields**: {metadata['col_count']}
- **Columns Detected**: {", ".join(metadata['columns'])}

## 🔍 Data Quality Metrics
- **Duplicate Records**: {metadata['duplicates']}
- **Missing Value Count**: {sum(metadata['missing_values'].values())} null cells detected.
- **Uninformative High-Uniqueness Columns (Index/IDs)**: {", ".join(metadata['not_useful_columns']) if metadata['not_useful_columns'] else "None"}

Please configure `GOOGLE_API_KEY` in your `.env` file with a valid Gemini key to generate reports!
"""
        return ReportResponse(
            session_id=session_id,
            report=report_content
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/session/{session_id}", status_code=status.HTTP_200_OK)
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a session's metadata and visual plots from Firestore and local cache."""
    check_session_ownership_or_raise(session_id, current_user["uid"])
    try:
        # 1. Try Firestore database deletion
        try:
            firebase_service.delete_session(session_id, current_user["uid"])
            using_firebase = True
        except Exception as e:
            # Fallback to local memory cache
            logger.warning(f"Database delete failed, trying local memory cache: {str(e)}")
            uid = current_user["uid"]
            if uid in LOCAL_SESSION_CACHE and session_id in LOCAL_SESSION_CACHE[uid]:
                del LOCAL_SESSION_CACHE[uid][session_id]
                save_local_session_cache()
                using_firebase = False
            else:
                raise KeyError()

        db_status = "Firebase Firestore" if using_firebase else "Local Cache"
        return {
            "session_id": session_id,
            "message": f"Successfully deleted session and all chat history from {db_status}."
        }
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    except Exception as e:
        logger.error(f"Error in delete session endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/sessions", response_model=List[SessionInfoResponse])
def get_all_sessions(current_user: dict = Depends(get_current_user)):
    """
    Retrieve all sessions stored in Firestore or the local cache belonging to the authenticated user.
    """
    try:
        try:
            return firebase_service.get_all_sessions(current_user["uid"])
        except Exception as e:
            logger.warning(f"Database fetch for sessions failed: {str(e)}. Falling back to local cache.")
            sessions = []
            uid = current_user["uid"]
            user_sessions = LOCAL_SESSION_CACHE.get(uid, {})
            for s_id, s_data in user_sessions.items():
                data_info = s_data.get("data_info", {})
                sessions.append({
                    "session_id": s_id,
                    "filename": s_data.get("filename"),
                    "row_count": data_info.get("row_count", 0),
                    "columns": data_info.get("columns", [])
                })
            return sessions
    except Exception as e:
        logger.error(f"Error in get_all_sessions endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )

@router.get("/summary/ping_test")
def ping_test():
    """Simple ping test endpoint for connection checks."""
    return {"status": "online"}

