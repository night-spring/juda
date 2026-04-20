import streamlit as st
import sys
import os
import tempfile
import json

# Add the parent directory to the path to import from llm and eda
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from llm.llm_model import LLM
from eda.utils import store_data_info

# Initialize the LLM if not in session state
if 'llm' not in st.session_state:
    st.session_state.llm = LLM()

if 'messages' not in st.session_state:
    st.session_state.messages = []

# Check if data is uploaded
data_uploaded = 'llm' in st.session_state and st.session_state.llm.data_info is not None

# Set page config
st.set_page_config(
    page_title="Juda Chat Assistant",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .sidebar-header {
        font-size: 1.5rem;
        font-weight: bold;
        color: #ff7f0e;
        margin-bottom: 1rem;
    }
    .chat-container {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
        background-color: #f9f9f9;
    }
    .user-message {
        background-color: #e3f2fd;
        padding: 0.5rem;
        border-radius: 5px;
        margin: 0.5rem 0;
    }
    .assistant-message {
        background-color: #f3e5f5;
        padding: 0.5rem;
        border-radius: 5px;
        margin: 0.5rem 0;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">🤖 Juda Chat Assistant</div>', unsafe_allow_html=True)

# Sidebar for CSV upload and controls
with st.sidebar:
    st.markdown('<div class="sidebar-header">📊 Data Upload</div>', unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv", help="Upload your data file to chat about it")
    
    if uploaded_file is not None:
        with st.spinner("Processing CSV..."):
            # Save uploaded file to temp
            with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_path = tmp_file.name
            
            try:
                # Process the CSV
                store_data_info(tmp_path)
                
                # Load data_info
                with open("data/data_info.json", "r") as f:
                    data_info = json.load(f)
                
                # Set in LLM
                if 'llm' in st.session_state:
                    st.session_state.llm.set_data_info(json.dumps(data_info, indent=2))
                
                st.success("✅ CSV processed successfully!")
                
            except Exception as e:
                st.error(f"❌ Error processing CSV: {str(e)}")
            finally:
                # Clean up temp file
                os.unlink(tmp_path)
    
    # Display data summary if data is loaded
    if data_uploaded:
        with st.expander("📈 Data Summary", expanded=False):
            try:
                with open("data/data_info.json", "r") as f:
                    data_info = json.load(f)
                st.json(data_info)
            except:
                st.write("Data info not available")
    
    st.markdown("---")
    
    # Clear data button
    if st.button("🗑️ Remove Data", help="Remove the uploaded data and start fresh"):
        if 'llm' in st.session_state:
            st.session_state.llm.data_info = None
            st.session_state.llm.chat_history = []
        if 'messages' in st.session_state:
            st.session_state.messages = []
        st.rerun()

# Initialize the LLM if not in session state
if 'llm' not in st.session_state:
    st.session_state.llm = LLM()

if 'messages' not in st.session_state:
    st.session_state.messages = []

# Check if data is uploaded
data_uploaded = 'llm' in st.session_state and st.session_state.llm.data_info is not None

# Main chat area
st.markdown("### 💬 Chat with Your Data")

# Check if data is uploaded
data_uploaded = 'llm' in st.session_state and st.session_state.llm.data_info is not None

if not data_uploaded:
    st.info("📤 **No data uploaded yet!** Please upload a CSV file using the sidebar to start chatting about your data.")
else:
    st.success("✅ **Data loaded!** You can now ask questions about your uploaded data.")

# Display chat messages in a container
with st.container():
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

# Chat input at the bottom
st.markdown("---")
if data_uploaded:
    if prompt := st.chat_input("Ask me anything about your data...", key="chat_input"):
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(prompt)

        # Get response from LLM
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                try:
                    response = st.session_state.llm.chat(prompt)
                    st.markdown(response)
                    st.session_state.messages.append({"role": "assistant", "content": response})
                except Exception as e:
                    error_msg = f"❌ Sorry, I encountered an error: {str(e)}"
                    st.error(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})
else:
    st.chat_input("Upload a CSV file first to enable chat...", key="chat_input", disabled=True)

# Footer
st.markdown("---")
st.markdown("*Built with Streamlit and LangChain*")