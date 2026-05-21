import pandas as pd
import numpy as np
import logging

logger = logging.getLogger("juda.eda")

class EDAService:
    @staticmethod
    def parse_csv_to_dataframe(file_stream) -> pd.DataFrame:
        """Parse an uploaded CSV file stream directly into a pandas DataFrame in-memory."""
        try:
            # Re-read from beginning of file stream
            file_stream.seek(0)
            df = pd.read_csv(file_stream)
            logger.info(f"Loaded DataFrame in-memory: {df.shape[0]} rows, {df.shape[1]} columns")
            return df
        except Exception as e:
            logger.error(f"Failed to parse CSV in-memory: {str(e)}")
            raise ValueError(f"Invalid CSV file format: {str(e)}")

    @staticmethod
    def get_data_metadata(df: pd.DataFrame) -> dict:
        """
        Analyze the DataFrame and return structured summary metadata.
        This represents 'data_info' stored in the database.
        """
        columns = df.columns.tolist()
        numerical_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()

        # Identify 'not useful' ID-like columns (uniqueness ratio > 98%)
        not_useful_columns = []
        for col in columns:
            if len(df) > 0:
                uniqueness_ratio = df[col].nunique() / len(df)
                if uniqueness_ratio > 0.98:
                    not_useful_columns.append(col)

        # Drop not useful columns *only for summary statistics calculations* to keep metadata clean
        df_clean = df.drop(columns=not_useful_columns, errors='ignore')
        
        # Describe numerical columns
        summary_dict = {}
        if not df_clean.select_dtypes(include=[np.number]).empty:
            summary_dict = df_clean.describe().to_dict()

        # Missing values dict
        missing_dict = df.isnull().sum().to_dict()

        # Duplicates count
        duplicates_count = int(df.duplicated().sum())

        # Correlations (only numeric)
        correlations_dict = {}
        numeric_df = df_clean.select_dtypes(include=[np.number])
        if not numeric_df.empty and numeric_df.shape[1] > 1:
            correlations_dict = numeric_df.corr().replace({np.nan: None}).to_dict()

        # Categorical columns frequency breakdown
        categorical_summary = {}
        for col in categorical_columns:
            if col not in not_useful_columns:
                counts = df[col].value_counts()
                percentages = (counts * 100 / len(df)) if len(df) > 0 else counts
                # Limit to top 10 categories to avoid massive JSON payloads
                categorical_summary[col] = percentages.head(10).to_dict()

        metadata = {
            "columns": columns,
            "numerical_columns": numerical_columns,
            "categorical_columns": categorical_columns,
            "not_useful_columns": not_useful_columns,
            "summary": summary_dict,
            "missing_values": missing_dict,
            "duplicates": duplicates_count,
            "correlations": correlations_dict,
            "categorical_summary": categorical_summary,
            "row_count": len(df),
            "col_count": len(columns)
        }
        return metadata

eda_service = EDAService()
