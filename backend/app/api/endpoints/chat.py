import json
import logging
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.chat import ChatRequest, ChatResponse, ChatMessage
from app.services.firebase_service import firebase_service, FirebaseNotConfiguredException
from app.services.llm_service import llm_service, GeminiNotConfiguredException
from app.api.endpoints.eda import LOCAL_SESSION_CACHE, save_local_session_cache, check_session_ownership_or_raise
from app.api.deps import get_current_user

logger = logging.getLogger("juda.api.chat")
router = APIRouter(prefix="/chat", tags=["Data Assistant Chat"])

@router.post("/{session_id}", response_model=ChatResponse)
def chat_with_data(session_id: str, request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Ask questions about your uploaded dataset.
    Maintains stateless history using Firestore database, injecting dataset summaries automatically.
    """
    check_session_ownership_or_raise(session_id, current_user["uid"])
    user_msg = request.message.strip()
    if not user_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat message cannot be blank."
        )

    try:
        # 1. Fetch Session Metadata & Chat History
        # 1. Fetch Session Metadata & Chat History
        try:
            metadata = firebase_service.get_session_data_info(session_id, current_user["uid"])
            chat_history = firebase_service.get_chat_history(session_id, current_user["uid"])
            using_firebase = True
        except Exception as e:
            # Fallback to local memory cache
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            uid = current_user["uid"]
            if uid not in LOCAL_SESSION_CACHE or session_id not in LOCAL_SESSION_CACHE[uid]:
                raise KeyError()
            metadata = LOCAL_SESSION_CACHE[uid][session_id]["data_info"]
            chat_history = LOCAL_SESSION_CACHE[uid][session_id]["messages"]
            using_firebase = False

        metadata_str = json.dumps(metadata, indent=2, default=str)

        # 2. Invoke Gemini LLM
        try:
            ai_response = llm_service.chat(
                chat_history=chat_history,
                user_message=user_msg,
                data_info_str=metadata_str
            )
        except Exception as e:
            logger.warning(f"LLM fallback activated due to failure/unconfigured: {str(e)}")
            # Helpful mock chat reply
            ai_response = (
                f"🤖 [Mock AI response] I received your question: '{user_msg}'. "
                "However, your `GOOGLE_API_KEY` environment variable is either invalid, not set, or failed. "
                "Once you add a valid Gemini key, I will analyze this dataset and answer accurately!"
            )

        # 3. Persist conversation turn
        uid = current_user["uid"]
        if using_firebase:
            try:
                firebase_service.add_message(session_id, "human", user_msg, uid)
                firebase_service.add_message(session_id, "assistant", ai_response, uid)
            except Exception as e:
                logger.error(f"Failed to save messages to database: {str(e)}. Storing in local cache instead.")
                if uid not in LOCAL_SESSION_CACHE:
                    LOCAL_SESSION_CACHE[uid] = {}
                if session_id not in LOCAL_SESSION_CACHE[uid]:
                    LOCAL_SESSION_CACHE[uid][session_id] = {"messages": []}
                LOCAL_SESSION_CACHE[uid][session_id]["messages"].append({"role": "human", "content": user_msg})
                LOCAL_SESSION_CACHE[uid][session_id]["messages"].append({"role": "assistant", "content": ai_response})
                save_local_session_cache()
        else:
            # Save in local mock cache
            if uid not in LOCAL_SESSION_CACHE:
                LOCAL_SESSION_CACHE[uid] = {}
            if session_id not in LOCAL_SESSION_CACHE[uid]:
                LOCAL_SESSION_CACHE[uid][session_id] = {"messages": []}
            LOCAL_SESSION_CACHE[uid][session_id]["messages"].append({"role": "human", "content": user_msg})
            LOCAL_SESSION_CACHE[uid][session_id]["messages"].append({"role": "assistant", "content": ai_response})
            save_local_session_cache()

        return ChatResponse(
            session_id=session_id,
            response=ai_response
        )

    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/history/{session_id}", response_model=List[ChatMessage])
def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieve ordered conversation logs for a session.
    Fetches from Firestore if available, otherwise falls back to local cache.
    """
    check_session_ownership_or_raise(session_id, current_user["uid"])
    try:
        try:
            return firebase_service.get_chat_history(session_id, current_user["uid"])
        except Exception as e:
            logger.warning(f"Database fetch for chat history failed: {str(e)}. Falling back to local cache.")
            uid = current_user["uid"]
            if uid not in LOCAL_SESSION_CACHE or session_id not in LOCAL_SESSION_CACHE[uid]:
                raise KeyError()
            return LOCAL_SESSION_CACHE[uid][session_id].get("messages", [])
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/history/{session_id}", status_code=status.HTTP_200_OK)
def clear_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    """
    Clear all chat conversation logs for a session from Firestore and local cache.
    """
    check_session_ownership_or_raise(session_id, current_user["uid"])
    try:
        # 1. Clear database
        try:
            firebase_service.clear_chat_history(session_id, current_user["uid"])
        except Exception as e:
            logger.warning(f"Database clear failed, falling back to local memory: {str(e)}")
            
        # 2. Clear local cache if present
        uid = current_user["uid"]
        if uid in LOCAL_SESSION_CACHE and session_id in LOCAL_SESSION_CACHE[uid]:
            LOCAL_SESSION_CACHE[uid][session_id]["messages"] = []
            save_local_session_cache()
            
        return {"status": "success", "message": f"Chat history for session '{session_id}' successfully cleared."}
    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
