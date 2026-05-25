import os
import sys
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from dotenv import load_dotenv
load_dotenv()

# Reconfigure stdout/stderr to UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    key = os.getenv("HUGGINGFACE_API_KEY")
    if key:
        try:
            llm_endpoint = HuggingFaceEndpoint(
                huggingfacehub_api_token=key,
                repo_id='meta-llama/Llama-3.1-8B-Instruct',
                task='text-generation',
                temperature=0.3
            )
            llm = ChatHuggingFace(llm=llm_endpoint)
            response = llm.invoke("Hello, are you active?")
            print("[SUCCESS] Hugging Face response:", response.content)
        except Exception as e:
            print("[ERROR] Error calling Hugging Face:", str(e))
    else:
        print("[WARNING] HUGGINGFACE_API_KEY is not set in environment.")
