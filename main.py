import os
import json
from eda.utils import store_data_info
from llm.utils import generate_report

def main():
    file_path = os.path.abspath("data/data.csv")
    store_data_info(file_path)
    report = generate_report()
    print(report)

if __name__ == "__main__":
    main()
