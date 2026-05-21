import io
import uuid
import json
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.models.eda import UploadResponse, ReportResponse, MetadataResponse
from app.services.eda_service import eda_service
from app.services.viz_service import viz_service
from app.services.firebase_service import firebase_service, FirebaseNotConfiguredException
from app.services.llm_service import llm_service, GeminiNotConfiguredException

logger = logging.getLogger("juda.api.eda")
router = APIRouter(prefix="/eda", tags=["Exploratory Data Analysis"])

# Thread-safe in-memory cache fallback for local mock testing without Firebase
LOCAL_SESSION_CACHE = {}

@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_csv(file: UploadFile = File(...)):
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
                base64_plots=plots_base64
            )
            using_firebase = True
        except Exception as e:
            # Fallback to local cache for mock trials or database errors
            logger.warning(f"Database fallback activated due to failure/unconfigured: {str(e)}")
            LOCAL_SESSION_CACHE[session_id] = {
                "filename": file.filename,
                "data_info": metadata,
                "plots": plots_base64,
                "messages": []
            }
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
def get_session_summary(session_id: str):
    """Retrieve raw parsed JSON data statistics for a session."""
    try:
        # Try Firebase first
        try:
            metadata = firebase_service.get_session_data_info(session_id)
        except Exception as e:
            # Fallback
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            if session_id not in LOCAL_SESSION_CACHE:
                raise KeyError()
            metadata = LOCAL_SESSION_CACHE[session_id]["data_info"]

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
def generate_eda_report(session_id: str):
    """Use Google Gemini to generate a markdown analytical report from the dataset summary metadata."""
    try:
        # Load metadata
        try:
            metadata = firebase_service.get_session_data_info(session_id)
        except Exception as e:
            logger.warning(f"Database fetch failed, falling back to local memory: {str(e)}")
            if session_id not in LOCAL_SESSION_CACHE:
                raise KeyError()
            metadata = LOCAL_SESSION_CACHE[session_id]["data_info"]

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
