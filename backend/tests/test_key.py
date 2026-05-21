import os
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from dotenv import load_dotenv
load_dotenv()

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
            print("🎉 Success! Hugging Face response:", response.content)
        except Exception as e:
            print("❌ Error calling Hugging Face:", str(e))
    else:
        print("⚠️ HUGGINGFACE_API_KEY is not set in environment.")