import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Verify that the home page returns the correct project signature."""
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "online"
    assert "Juda" in json_data["project"]

def test_full_pipeline_mock_flow():
    """
    Test the entire lifecycle of the API:
    1. Upload a CSV file.
    2. Retrieve its metadata summary.
    3. Generate the analytical markdown report.
    4. Fetch pre-calculated visual plots.
    5. Run a conversation message exchange.
    All runs in safe in-memory fallback modes without requiring Firebase or Gemini keys.
    """
    # 1. Prepare dummy CSV stream
    csv_content = (
        "sepal_length,sepal_width,petal_length,petal_width,species\n"
        "5.1,3.5,1.4,0.2,setosa\n"
        "4.9,3.0,1.4,0.2,setosa\n"
        "4.7,3.2,1.3,0.2,setosa\n"
        "4.6,3.1,1.5,0.2,setosa\n"
        "5.0,3.6,1.4,0.2,setosa\n"
    )
    
    # Send post request
    headers = {"Authorization": "Bearer mock-token"}
    file_payload = {"file": ("iris_sample.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    upload_response = client.post("/api/v1/eda/upload", files=file_payload, headers=headers)
    
    assert upload_response.status_code == 201
    upload_json = upload_response.json()
    assert "session_id" in upload_json
    session_id = upload_json["session_id"]
    
    # 2. Get Metadata Summary
    summary_response = client.get(f"/api/v1/eda/summary/{session_id}", headers=headers)
    assert summary_response.status_code == 200
    summary_json = summary_response.json()
    assert summary_json["row_count"] == 5
    assert "sepal_length" in summary_json["numerical_columns"]
    
    # 3. Get Analytical Report
    report_response = client.get(f"/api/v1/eda/report/{session_id}", headers=headers)
    assert report_response.status_code == 200
    report_json = report_response.json()
    assert len(report_json["report"]) > 0
    
    # 4. Fetch Visualization base64 plots
    viz_response = client.get(f"/api/v1/viz/base64/{session_id}/missing_values", headers=headers)
    assert viz_response.status_code == 200
    viz_json = viz_response.json()
    assert "base64" in viz_json
    assert len(viz_json["base64"]) > 0
    
    # Fetch binary image
    img_response = client.get(f"/api/v1/viz/image/{session_id}/missing_values", headers=headers)
    assert img_response.status_code == 200
    assert img_response.headers["content-type"] == "image/png"
    
    # 5. Run Chat Session
    chat_payload = {"message": "Can you summarize the correlation values?"}
    chat_response = client.post(f"/api/v1/chat/{session_id}", json=chat_payload, headers=headers)
    assert chat_response.status_code == 200
    chat_json = chat_response.json()
    assert "response" in chat_json
    assert len(chat_json["response"]) > 0
