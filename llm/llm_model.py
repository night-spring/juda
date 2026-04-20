from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers  import StrOutputParser
from dotenv import load_dotenv
import os
import json

load_dotenv()

class LLM:
    def __init__(self):
        self.model = self.define_model()
        self.chat_history = []  # List of {"role": "human/assistant", "content": "..."}
        self.data_info = None

    def define_model(self):
        HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
        llm = HuggingFaceEndpoint(
            huggingfacehub_api_token=HUGGINGFACE_API_KEY,
            model='meta-llama/Llama-3.1-8B-Instruct',
            task='text-generation',
            temperature=0.3
        )

        model = ChatHuggingFace(llm=llm)
        return model

    def get_model(self):
        return self.model
            
    def get_system_prompt(self):
        with open("data/prompts.json", "r") as f:
            prompts = json.load(f)
            return prompts.get("system_prompt", "")
        
    def get_prompt_template(self, prompt):
        template = ChatPromptTemplate.from_messages([
            ("system", self.get_system_prompt()),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", prompt)
        ])
        return template
    
    def chat(self, user_input):
        # Check if data is uploaded
        if not self.data_info:
            return "I need data to chat about! Please upload a CSV file first using the sidebar on the left. Once uploaded, I can help you analyze and discuss your data."
        
        # Append user message
        self.chat_history.append({"role": "human", "content": user_input})
        
        # Create system prompt with data info
        system_prompt = self.get_system_prompt()
        system_prompt += "\n\nData Information:\n" + self.data_info
        
        # Create template with history
        template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
        ], template_format="jinja2")
        
        # Get response
        response = self.get_response(template, {"chat_history": self.chat_history})
        
        # Append AI response
        self.chat_history.append({"role": "assistant", "content": response})
        
        return response
    
    def get_report(self, data_info: str, report_generate_prompt: str):
        template = ChatPromptTemplate.from_messages([
            ("system", report_generate_prompt)
        ])
        variables = {"data_info":data_info}
        
        report = self.get_response(template, variables)
        return report

    def set_data_info(self, data_info):
        self.data_info = data_info

    def get_response(self, prompt_template, variables={}):
        str_parser = StrOutputParser()
        chain = prompt_template | self.model | str_parser
        response = chain.invoke(variables)
        return response
        
