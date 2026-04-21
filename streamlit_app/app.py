import streamlit as st
import sys
import os
import tempfile
import json

# Add the parent directory to the path to import from llm and eda
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from llm.llm_model import LLM
from eda.utils import store_data_info

# Force dark theme
st.markdown("""
<meta name="theme-color" content="#0f172a">
""", unsafe_allow_html=True)

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

# Load custom CSS from external files
def load_css():
    css_files = ["styles.css", "streamlit_overrides.css"]
    for css_file in css_files:
        css_path = os.path.join(os.path.dirname(__file__), css_file)
        try:
            with open(css_path, "r") as f:
                css_content = f.read()
            st.markdown(f"<style>{css_content}</style>", unsafe_allow_html=True)
        except FileNotFoundError:
            st.warning(f"CSS file '{css_file}' not found.")

# Load JavaScript files
def load_javascript():
    js_files = ["scroll_control.js"]
    for js_file in js_files:
        js_path = os.path.join(os.path.dirname(__file__), js_file)
        try:
            with open(js_path, "r") as f:
                js_content = f.read()
            st.markdown(f"<script>{js_content}</script>", unsafe_allow_html=True)
        except FileNotFoundError:
            st.warning(f"JavaScript file '{js_file}' not found.")

# Load all CSS files
load_css()

# Load all JavaScript files
load_javascript()

st.markdown('<div class="main-header"><h1>🤖 Juda Chat Assistant</h1></div>', unsafe_allow_html=True)

# Sidebar for CSV upload and controls
with st.sidebar:
    st.markdown('<div class="sidebar-header">📊 Data Upload</div>', unsafe_allow_html=True)
    
    st.markdown('<div class="sidebar-section">', unsafe_allow_html=True)
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv", help="Upload your data file to chat about it")
    st.markdown('</div>', unsafe_allow_html=True)
    
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
        st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)
        with st.expander("📈 Data Summary", expanded=False):
            st.markdown('<div class="data-summary">', unsafe_allow_html=True)
            try:
                with open("data/data_info.json", "r") as f:
                    data_info = json.load(f)
                st.json(data_info)
            except:
                st.write("Data info not available")
            st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)
    
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
st.markdown('<div class="chat-title">💬 Chat with Your Data</div>', unsafe_allow_html=True)

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
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
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
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
st.markdown("""
<div class="footer">
    Built with ❤️ using <a href="https://streamlit.io" target="_blank">Streamlit</a> and <a href="https://python.langchain.com" target="_blank">LangChain</a>
</div>
""", unsafe_allow_html=True)