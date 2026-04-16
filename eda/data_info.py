import pandas as pd

class DataInfo:
    def __init__(self, file_path: str) -> None:
        self.df = pd.read_csv(file_path)
        self.columns = self.df.columns.tolist()
        self.numerical_columns = self.df.select_dtypes(include='number').columns.tolist()
        self.categorical_columns = self.df.select_dtypes(include='object').columns.tolist()
        self.nunique_cols = self.detect_nunique_columns()

        self.df.drop(columns=self.nunique_cols, inplace=True)
    
    def get_summary(self):
        return self.df.describe()
    
    def check_missing_values(self):
        return self.df.isnull().sum()
    
    def check_duplicates(self):
        return self.df.duplicated().sum()
    
    def get_correlations(self):
        return self.df.corr(numeric_only=True)
    
    def detect_nunique_columns(self):
        nunique_cols = []

        for col in self.columns:
            uniqueness = self.df[col].nunique() / len(self.df)

            if uniqueness > 0.98:
                nunique_cols.append(col)

        return nunique_cols
