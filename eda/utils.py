from eda.data_info import DataInfo
import json

def get_data_info(file_path: str) -> dict:
    data_info = DataInfo(file_path)
    return {
        "columns": data_info.columns,
        "numerical_columns": data_info.numerical_columns,
        "categorical_columns": data_info.categorical_columns,
        "not_useful_columns": data_info.nunique_cols,
        "summary": data_info.get_summary().to_dict(),
        "missing_values": data_info.check_missing_values().to_dict(),
        "duplicates": int(data_info.check_duplicates()),
        "correlations": data_info.get_correlations().to_dict(),
        "categorical_summary": data_info.get_categorical_summary()
    }

def store_data_info(file_path: str) -> None:
    with open('data/data_info.json', "w") as f:
        json.dump(get_data_info(file_path), f, indent=4, default=str)