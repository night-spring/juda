from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class UploadResponse(BaseModel):
    session_id: str
    filename: str
    row_count: int
    columns: List[str]
    message: str

class ReportResponse(BaseModel):
    session_id: str
    report: str

class MetadataResponse(BaseModel):
    session_id: str
    columns: List[str]
    numerical_columns: List[str]
    categorical_columns: List[str]
    not_useful_columns: List[str]
    row_count: int
    col_count: int
    summary: Dict[str, Any]
    missing_values: Dict[str, int]
    duplicates: int
    correlations: Dict[str, Any]
    categorical_summary: Dict[str, Any]

class SessionInfoResponse(BaseModel):
    session_id: str
    filename: str
    row_count: int
    columns: List[str]
