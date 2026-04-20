# Juda - AI Data Analyst Agent

Juda is an AI-powered data analysis tool that processes CSV datasets, extracts key insights, and generates comprehensive reports using large language models. It features both a command-line interface for automated reporting and an interactive chat interface built with Streamlit.

## Features

- **Data Analysis**: Automatically analyzes CSV files to extract columns, data types, missing values, correlations, and more
- **AI-Powered Reporting**: Uses LangChain and Hugging Face models to generate detailed analytical reports
- **Interactive Chat Interface**: Streamlit-based chat assistant for conversational data analysis
- **Modular Architecture**: Separate modules for EDA (Exploratory Data Analysis) and LLM interactions

## Installation

1. Ensure you have Python 3.13 or higher installed
2. Install `uv` package manager if not already installed:
   ```bash
   pip install uv
   ```
3. Clone the repository and navigate to the project directory
4. Install dependencies:
   ```bash
   uv sync
   ```

## Usage

### Command Line Report Generation

To generate an automated report from the default data file (`data/data.csv`):

```bash
uv run main.py
```

This will process the data, extract insights, and print a comprehensive report.

### Interactive Chat Interface

To launch the Streamlit chat assistant:

```bash
uv run main.py chat
```

This opens a web interface where you can upload data files and interact with the AI analyst conversationally.

## Project Structure

- `main.py`: Entry point script
- `api/`: API-related code (if applicable)
- `data/`: Data files and configuration
  - `data.csv`: Sample dataset
  - `data_info.json`: Processed data information
  - `prompts.json`: LLM prompts
- `eda/`: Exploratory Data Analysis module
  - `data_cleaner.py`: Data cleaning utilities
  - `data_info.py`: Data information extraction
  - `utils.py`: EDA utilities
- `llm/`: Large Language Model module
  - `llm_model.py`: LLM model implementation
  - `llm_tools.py`: LLM tools and utilities
  - `utils.py`: LLM utilities
- `streamlit_app/`: Streamlit application
  - `app.py`: Main Streamlit app

## Dependencies

- langchain: For LLM orchestration
- langchain-huggingface: Hugging Face integration
- matplotlib: Data visualization
- pandas: Data manipulation
- streamlit: Web interface
- seaborn: Statistical visualization
- python-dotenv: Environment variable management
- pytest: Testing framework

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.