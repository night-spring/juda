import pandas as pd

class DataCleaner:
    def __init__(self, df) -> None:
        self.df = df
    
    def drop_duplicates(self):
        return self.df.drop_duplicates(keep='first', inplace=False, ignore_index=True)
    
    def fill_missing_values(self, column_name, method='mean'):
        if method == 'mean':
            fill_value = self.df[column_name].mean()
        elif method == 'median':
            fill_value = self.df[column_name].median()
        elif method == 'mode':
            fill_value = self.df[column_name].mode()[0]
        else:
            raise ValueError("Method must be 'mean', 'median', or 'mode'")
        
        return self.df[column_name].fillna(fill_value, inplace=False)
    
    def drop_columns(self, columns):
        return self.df.drop(columns=columns, inplace=False)
    
    def encode_categorical_columns(self, column_name):
        return pd.get_dummies(self.df[column_name], prefix=column_name, drop_first=True)
    
    def min_max_scaling(self, column_name):
        min_val = self.df[column_name].min()
        max_val = self.df[column_name].max()
        return (self.df[column_name] - min_val) / (max_val - min_val)
    
    def standard_scaling(self, column_name):
        mean = self.df[column_name].mean()
        std = self.df[column_name].std()
        return (self.df[column_name] - mean) / std
    
    def clean_data(self, drop_duplicates=True, fill_missing=None, drop_cols=None, encode_cols=None, scaling=None):
        cleaned_df = self.df.copy()
        
        if drop_duplicates:
            cleaned_df = self.drop_duplicates()
        
        if fill_missing:
            for col, method in fill_missing.items():
                cleaned_df[col] = self.fill_missing_values(col, method)
        
        if drop_cols:
            cleaned_df = self.drop_columns(drop_cols)
        
        if encode_cols:
            for col in encode_cols:
                encoded_cols = self.encode_categorical_columns(col)
                cleaned_df = pd.concat([cleaned_df, encoded_cols], axis=1).drop(columns=[col])
        
        if scaling:
            for col, method in scaling.items():
                if method == 'min_max':
                    cleaned_df[col] = self.min_max_scaling(col)
                elif method == 'standard':
                    cleaned_df[col] = self.standard_scaling(col)
                else:
                    raise ValueError("Scaling method must be 'min_max' or 'standard'")
        
        return cleaned_df
    