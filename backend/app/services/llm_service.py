import os
import json
import logging
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from app.config import settings

logger = logging.getLogger("juda.llm")

class HuggingFaceNotConfiguredException(Exception):
    """Exception raised when LLM actions are requested but HuggingFace is not configured."""
    pass

# Maintain compatibility alias to prevent import errors in routers
GeminiNotConfiguredException = HuggingFaceNotConfiguredException

class LLMService:
    def __init__(self):
        self.llm = None
        self.is_configured = False
        self._initialize_huggingface()

    def _initialize_huggingface(self):
        api_key = settings.HUGGINGFACE_API_KEY
        if not api_key:
            logger.warning(
                "⚠️ HUGGINGFACE_API_KEY is not set in environment. "
                "Hugging Face service is running in mock/unconfigured mode. Chat and reporting will fail gracefully."
            )
            return

        try:
            # Initialize Hugging Face Endpoint and Chat Wrapper
            llm_endpoint = HuggingFaceEndpoint(
                huggingfacehub_api_token=api_key,
                repo_id='meta-llama/Llama-3.1-8B-Instruct',
                task='text-generation',
                temperature=0.3
            )
            self.llm = ChatHuggingFace(llm=llm_endpoint)
            self.is_configured = True
            logger.info("✅ Hugging Face Llama 3.1 LLM Service initialized successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Hugging Face LLM: {str(e)}")
            self.llm = None
            self.is_configured = False

    def _check_llm_ready(self):
        if not self.is_configured or self.llm is None:
            raise HuggingFaceNotConfiguredException(
                "Hugging Face is not configured yet. "
                "Please configure HUGGINGFACE_API_KEY in your .env file with a valid access token."
            )

    def _load_prompts(self) -> dict:
        """Helper to load system and report prompts from local JSON config."""
        default_prompts = {
            "system_prompt": "You are a helpful assistant for data analysis. You will answer general queries and give insights. If you do not know the answer, say you don't know. Always be concise and to the point.",
            "report_generate_prompt": "You are a data analyst. Generate a clear and professional report based on the provided data summary:\n{data_info}"
        }
        
        prompt_path = "data/prompts.json"
        if not os.path.exists(prompt_path):
            return default_prompts
        
        try:
            with open(prompt_path, "r") as f:
                prompts = json.load(f)
                return {
                    "system_prompt": prompts.get("system_prompt", default_prompts["system_prompt"]),
                    "report_generate_prompt": prompts.get("report_generate_prompt", default_prompts["report_generate_prompt"])
                }
        except Exception as e:
            logger.error(f"Error reading prompts.json: {str(e)}")
            return default_prompts

    def generate_eda_report(self, data_info_str: str) -> str:
        """Use Llama 3.1 to generate a beautifully structured comprehensive Markdown analysis report from dataset metadata."""
        self._check_llm_ready()
        
        prompts = self._load_prompts()
        report_template_str = prompts["report_generate_prompt"]
        
        # Build ChatPromptTemplate and LCEL chain
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", report_template_str)
        ])
        
        parser = StrOutputParser()
        chain = prompt_template | self.llm | parser
        
        logger.info("Requesting Llama 3.1 to generate EDA report...")
        report = chain.invoke({"data_info": data_info_str})
        return report

    def chat(self, chat_history: list, user_message: str, data_info_str: str) -> str:
        """
        Conduct a stateless conversation with Llama 3.1.
        Compiles the system prompt + dataset metadata, merges Firestore history, 
        and appends the current user query.
        """
        self._check_llm_ready()
        
        prompts = self._load_prompts()
        system_instruction = f"{prompts['system_prompt']}\n\n[Context: Tabular Dataset Metadata]\n{data_info_str}"
        
        # Compile Langchain Message list
        messages = [SystemMessage(content=system_instruction)]
        
        # Convert raw firebase list to LangChain message models
        for message in chat_history:
            role = message.get("role")
            content = message.get("content")
            if role == "human":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
                
        # Append the new user message
        messages.append(HumanMessage(content=user_message))
        
        logger.info(f"Invoking Llama 3.1 chat chain with history size: {len(chat_history)}")
        response = self.llm.invoke(messages)
        
        # Clean up response text if returned as object
        response_text = response.content if hasattr(response, 'content') else str(response)
        return response_text

llm_service = LLMService()
