import json
import logging
from fastapi import APIRouter, HTTPException, status
from app.models.chat import ChatRequest, ChatResponse
from app.services.firebase_service import firebase_service, FirebaseNotConfiguredException
from app.services.llm_service import llm_service, GeminiNotConfiguredException
from app.api.endpoints.eda import LOCAL_SESSION_CACHE

logger = logging.getLogger("juda.api.chat")
router = APIRouter(prefix="/chat", tags=["Data Assistant Chat"])

@router.post("/{session_id}", response_model=ChatResponse)
def chat_with_data(session_id: str, request: ChatRequest):
    """
    Ask questions about your uploaded dataset.
    Maintains stateless history using Firestore database, injecting dataset summaries automatically.
    """
    user_msg = request.message.strip()
    if not user_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat message cannot be blank."
        )

    try:
        # 1. Fetch Session Metadata & Chat History
        try:
            metadata = firebase_service.get_session_data_info(session_id)
            chat_history = firebase_service.get_chat_history(session_id)
            using_firebase = True
        except Exception as e:
            # Fallback to local memory cache
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            if session_id not in LOCAL_SESSION_CACHE:
                raise KeyError()
            metadata = LOCAL_SESSION_CACHE[session_id]["data_info"]
            chat_history = LOCAL_SESSION_CACHE[session_id]["messages"]
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
        if using_firebase:
            try:
                firebase_service.add_message(session_id, "human", user_msg)
                firebase_service.add_message(session_id, "assistant", ai_response)
            except Exception as e:
                logger.error(f"Failed to save messages to database: {str(e)}. Storing in local cache instead.")
                LOCAL_SESSION_CACHE[session_id]["messages"].append({"role": "human", "content": user_msg})
                LOCAL_SESSION_CACHE[session_id]["messages"].append({"role": "assistant", "content": ai_response})
        else:
            # Save in local mock cache
            LOCAL_SESSION_CACHE[session_id]["messages"].append({"role": "human", "content": user_msg})
            LOCAL_SESSION_CACHE[session_id]["messages"].append({"role": "assistant", "content": ai_response})

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
