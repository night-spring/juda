import json
from llm.llm_model import LLM

def generate_report():
    data_info = None
    with open("data/data_info.json", "r") as f:
        data_info = json.load(f)
    data_info_str = json.dumps(data_info, indent=4)

    report_generate_prompt = None
    with open("data/prompts.json", "r") as f:
        prompts = json.load(f)
        report_generate_prompt = prompts.get("report_generate_prompt")
    
    llm = LLM()
    report = llm.get_report(data_info_str, report_generate_prompt)
    return report

