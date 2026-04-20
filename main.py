import os
import json
import subprocess
import sys
from eda.utils import store_data_info
from llm.utils import generate_report

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "chat":
        # Run Streamlit app
        subprocess.run([sys.executable, "-m", "streamlit", "run", "streamlit_app/app.py"])
    else:
        # Default behavior: data processing
        file_path = os.path.abspath("data/data.csv")
        store_data_info(file_path)
        report = generate_report()
        print(report)

if __name__ == "__main__":
    main()
