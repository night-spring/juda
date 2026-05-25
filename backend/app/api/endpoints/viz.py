import base64
import logging
from fastapi import APIRouter, HTTPException, Response, status
from app.services.firebase_service import firebase_service, FirebaseNotConfiguredException
from app.api.endpoints.eda import LOCAL_SESSION_CACHE

logger = logging.getLogger("juda.api.viz")
router = APIRouter(prefix="/viz", tags=["Data Visualizations"])

def _get_base64_plot_string(session_id: str, plot_type: str) -> str:
    """Helper to fetch the Base64 plot string for a given session from Firestore or Local Cache."""
    valid_plots = ["correlation", "missing_values", "distributions"]
    if plot_type not in valid_plots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plot type. Supported types are: {', '.join(valid_plots)}"
        )

    try:
        try:
            plots = firebase_service.get_session_plots(session_id)
        except Exception as e:
            # Fallback to local memory cache
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            if session_id not in LOCAL_SESSION_CACHE:
                raise KeyError()
            plots = LOCAL_SESSION_CACHE[session_id]["plots"]

        plot_str = plots.get(plot_type)
        if not plot_str:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plot '{plot_type}' was not successfully generated for this session."
            )
        return plot_str

    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

@router.get("/base64/{session_id}/{plot_type}")
def get_plot_as_base64(session_id: str, plot_type: str):
    """
    Retrieve a pre-generated visualization as a Base64-encoded JSON response.
    Suitable for direct embedding in frontends (<img src="data:image/png;base64,...">).
    """
    base64_str = _get_base64_plot_string(session_id, plot_type)
    return {
        "session_id": session_id,
        "plot_type": plot_type,
        "format": "png",
        "base64": base64_str
    }

@router.get("/image/{session_id}/{plot_type}")
def get_plot_as_binary_image(session_id: str, plot_type: str):
    """
    Retrieve a pre-generated visualization as a direct binary PNG image stream.
    Can be loaded directly in browsers or markdown image tags.
    """
    base64_str = _get_base64_plot_string(session_id, plot_type)
    try:
        # Decode base64 to binary bytes
        img_bytes = base64.b64decode(base64_str)
        return Response(content=img_bytes, media_type="image/png")
    except Exception as e:
        logger.error(f"Error decoding base64 image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decode visualization image bytes."
        )
