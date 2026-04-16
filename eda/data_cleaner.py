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