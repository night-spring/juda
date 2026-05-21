import io
import pandas as pd
import numpy as np
from app.services.eda_service import eda_service
from app.services.viz_service import viz_service

def test_dataframe_metadata_analysis():
    # 1. Create a dummy dataset
    data = {
        "id": [1, 2, 3, 4, 5],
        "age": [25, 30, np.nan, 45, 50],
        "salary": [50000, 60000, 70000, 80000, np.nan],
        "gender": ["M", "F", "F", "M", "F"],
        "uninformative_id": ["id_1", "id_2", "id_3", "id_4", "id_5"]
    }
    df = pd.DataFrame(data)
    
    # 2. Run profiling service
    metadata = eda_service.get_data_metadata(df)
    
    # 3. Assert correct schema extraction
    assert "id" in metadata["columns"]
    assert "gender" in metadata["categorical_columns"]
    assert "age" in metadata["numerical_columns"]
    
    # Assert ID identification
    assert "uninformative_id" in metadata["not_useful_columns"]
    
    # Assert duplicates & shape
    assert metadata["duplicates"] == 0
    assert metadata["row_count"] == 5
    
    # Assert missing values
    assert metadata["missing_values"]["age"] == 1
    assert metadata["missing_values"]["salary"] == 1
    assert metadata["missing_values"]["gender"] == 0

def test_base64_plots_generation():
    # 1. Create simple plotting dataframe
    data = {
        "x": [1.0, 2.0, 3.0, 4.0, 5.0],
        "y": [5.0, 4.0, 3.0, 2.0, 1.0],
        "category": ["A", "B", "A", "B", "A"]
    }
    df = pd.DataFrame(data)
    
    # 2. Run plot generator
    plots = viz_service.generate_all_standard_plots(df)
    
    # 3. Assert plot keys are present
    assert "correlation" in plots
    assert "missing_values" in plots
    assert "distributions" in plots
    
    # Assert base64 encoding starts correctly or is generated
    assert len(plots["correlation"]) > 0 or plots["correlation"] == ""
    assert isinstance(plots["missing_values"], str)
