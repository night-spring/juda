import matplotlib
# Use Agg backend for thread-safe non-interactive plotting in web servers
matplotlib.use('Agg')

import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger("juda.viz")

class VizService:
    @staticmethod
    def _fig_to_base64(fig) -> str:
        """Helper to convert a Matplotlib figure into a Base64-encoded PNG string."""
        buf = io.BytesIO()
        try:
            fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
            buf.seek(0)
            img_bytes = buf.read()
            base64_str = base64.b64encode(img_bytes).decode('utf-8')
            return base64_str
        finally:
            buf.close()
            plt.close(fig) # Absolutely ensure resources are freed

    @classmethod
    def generate_all_standard_plots(cls, df: pd.DataFrame) -> dict:
        """
        Generate a pre-computed dictionary of all standard visualizations in-memory.
        Returns: { 'correlation': 'base64...', 'missing_values': 'base64...', 'distributions': 'base64...' }
        """
        plots = {}
        
        # 1. Missing Values Plot
        try:
            plots['missing_values'] = cls.generate_missing_values_plot(df)
        except Exception as e:
            logger.error(f"Failed to generate missing values plot: {str(e)}")
            plots['missing_values'] = ""

        # 2. Correlation Heatmap
        try:
            plots['correlation'] = cls.generate_correlation_heatmap(df)
        except Exception as e:
            logger.error(f"Failed to generate correlation plot: {str(e)}")
            plots['correlation'] = ""

        # 3. Numeric Distributions Plot
        try:
            plots['distributions'] = cls.generate_distributions_plot(df)
        except Exception as e:
            logger.error(f"Failed to generate distributions plot: {str(e)}")
            plots['distributions'] = ""

        return plots

    @classmethod
    def generate_missing_values_plot(cls, df: pd.DataFrame) -> str:
        """Plot missing values frequency per column."""
        missing = df.isnull().sum()
        missing = missing[missing > 0]
        
        if missing.empty:
            # Create a simple "No missing values" placeholder figure
            fig, ax = plt.subplots(figsize=(6, 2))
            ax.text(0.5, 0.5, "No Missing Values Found 🎉", 
                    fontsize=14, ha='center', va='center', color='#10b981')
            ax.axis('off')
            return cls._fig_to_base64(fig)

        fig, ax = plt.subplots(figsize=(8, 4))
        sns.barplot(x=missing.values, y=missing.index, ax=ax, hue=missing.index, palette="crest", legend=False)
        ax.set_title("Missing Values Count by Column", fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel("Number of Missing Records", fontsize=10)
        ax.set_ylabel("Column Name", fontsize=10)
        sns.despine(left=True, bottom=True)
        return cls._fig_to_base64(fig)

    @classmethod
    def generate_correlation_heatmap(cls, df: pd.DataFrame) -> str:
        """Plot correlation matrix heatmap for numerical fields."""
        # Isolate numerical columns and drop non-useful columns
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty or numeric_df.shape[1] < 2:
            fig, ax = plt.subplots(figsize=(6, 2))
            ax.text(0.5, 0.5, "Insufficient Numeric Fields for Correlation Plot", 
                    fontsize=12, ha='center', va='center', color='#64748b')
            ax.axis('off')
            return cls._fig_to_base64(fig)

        # Drop ID-like fields from correlation plotting
        for col in list(numeric_df.columns):
            if df[col].nunique() / len(df) > 0.98:
                numeric_df = numeric_df.drop(columns=[col])

        if numeric_df.shape[1] < 2:
            fig, ax = plt.subplots(figsize=(6, 2))
            ax.text(0.5, 0.5, "Insufficient Numeric Fields for Correlation Plot", 
                    fontsize=12, ha='center', va='center', color='#64748b')
            ax.axis('off')
            return cls._fig_to_base64(fig)

        corr = numeric_df.corr()
        fig, ax = plt.subplots(figsize=(8, 6))
        
        # Plot with highly tailored styling
        mask = np.triu(np.ones_like(corr, dtype=bool))
        sns.heatmap(
            corr, 
            mask=mask, 
            annot=True, 
            fmt=".2f", 
            cmap="coolwarm", 
            vmin=-1, 
            vmax=1, 
            center=0,
            square=True, 
            linewidths=.5, 
            cbar_kws={"shrink": .8},
            ax=ax
        )
        ax.set_title("Correlation Heatmap (Numerical Fields)", fontsize=14, fontweight='bold', pad=15)
        return cls._fig_to_base64(fig)

    @classmethod
    def generate_distributions_plot(cls, df: pd.DataFrame) -> str:
        """Plot distributions for up to 4 major numerical fields."""
        numeric_df = df.select_dtypes(include=[np.number])
        # Exclude ID fields
        cols_to_plot = []
        for col in numeric_df.columns:
            if df[col].nunique() / len(df) <= 0.98:
                cols_to_plot.append(col)

        cols_to_plot = cols_to_plot[:4] # Limit to top 4

        if not cols_to_plot:
            fig, ax = plt.subplots(figsize=(6, 2))
            ax.text(0.5, 0.5, "No Numerical Fields Available for Distribution Plot", 
                    fontsize=12, ha='center', va='center', color='#64748b')
            ax.axis('off')
            return cls._fig_to_base64(fig)

        n_cols = len(cols_to_plot)
        fig, axes = plt.subplots(1, n_cols, figsize=(4 * n_cols, 3.5), squeeze=False)
        
        for i, col in enumerate(cols_to_plot):
            ax = axes[0, i]
            # Plot histogram and KDE
            sns.histplot(df[col].dropna(), kde=True, ax=ax, color="#3b82f6")
            ax.set_title(f"Distribution of {col}", fontsize=11, fontweight='bold')
            ax.set_xlabel("")
            ax.set_ylabel("")
            sns.despine(ax=ax)
            
        fig.tight_layout()
        return cls._fig_to_base64(fig)

viz_service = VizService()
