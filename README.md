# 📊 Juda — Privacy-First AI Data Analyst Agent

> **Juda** is a high-performance, premium AI-powered Data Analyst workspace. Designed for security-conscious enterprises, it features a **zero-disk data policy** where datasets are processed entirely in-memory. Juda generates exploratory statistics, high-fidelity statistical visualizations, and comprehensive analytical reports via stateful chat conversations powered by **Llama-3.1-8B-Instruct** and a clinical **Alabaster Studio (Clean B2B SaaS)** user interface.

---

## 🏛️ System Architecture & Workflow

Juda is structured as a decoupled, full-stack application utilizing a hot-swappable local/cloud persistence layer.

```
                      [ Client Browser (React SPA Workspace) ]
                                    │      ▲
              1. Upload CSV (In-Memory)     │ 4. Base64 Images & JSON Results
                                    ▼      │
┌───────────────────────────────── backend/app (FastAPI) ─────────────────────────────────┐
│                                                                                         │
│   ┌────────────────────┐      ┌─────────────────────┐      ┌────────────────────────┐   │
│   │    eda_service     │      │     viz_service     │      │      llm_service       │   │
│   │                    │      │                     │      │                        │   │
│   │ • In-Memory Pandas │ ───> │ • Seaborn/Matplotlib│ ───> │ • LangChain Expression │   │
│   │ • Column stats     │      │ • Base64 Encoding   │      │   Language (LCEL)      │   │
│   │ • Cleaning/Summary │      │                     │      │ • Llama-3.1-8B-Instruct│   │
│   └────────────────────┘      └─────────────────────┘      └────────────────────────┘   │
│              │                           │                              │               │
│              └───────────────────────────┼──────────────────────────────┘               │
│                                          ▼                                              │
│                            [ firebase_service (Firestore) ]                             │
│                                          │                                              │
└──────────────────────────────────────────┼──────────────────────────────────────────────┘
                                           ▼
                                 [ Cloud Firestore ]
                                 • sessions/{id} (Metadata & Base64 Plots)
                                 • sessions/{id}/messages (Chat History logs)
```

---

## ✨ Key Capabilities & Architectural Pillars

### 🔒 1. Privacy-First "Zero-Disk" Policy
To guarantee enterprise security and data privacy, **no raw CSV files or dataset records are ever stored on a server disk or saved to external databases.** 
- CSV datasets are ingested and parsed as local, temporary in-memory DataFrames using Pandas.
- EDA statistics and visual plots are immediately compiled into Base64 PNGs and structural metadata JSON summaries.
- The DataFrame is aggressively garbage collected from system RAM. Subsequent AI chat interactions operate exclusively within the bounds of this pre-calculated metadata context.

### 🎨 2. Alabaster Studio (Clean B2B SaaS) Interface
The frontend follows a highly cohesive, clinical UI matching the design languages of Stripe, Clerk, and Linear:
- **Clean Aesthetic**: A slate-white background (`#F8FAFC`) layered with an ultra-subtle `20px` dot-mesh pattern, clean hairline borders (`#E2E8F0`), and premium typography (Inter/Geist).
- **Responsive Workspace**: A dual-pane split layout featuring a collapsible ChatGPT-style history sidebar, slick drag-and-drop portals, and dynamic animations.
- **Smart Conversations**: Sleek user message bubbles, inline analytical markdown cards, and relative visual plot links intercepted to render interactive widgets with high-fidelity click-to-expand lightbox zoom frames.
- **Adaptive Scrolling**: Auto-scrolls on new user entries but stays anchored statically during AI reply generation to let users read streaming outputs at their own pace.

### 🧠 3. Context-Aware LLM Analyst (Llama-3.1-8B-Instruct)
Juda utilizes LangChain Expression Language (LCEL) and Hugging Face's `Llama-3.1-8B-Instruct` model to orchestrate a dataset-aware analytical partner:
- **Comprehensive Reports**: Automatically produces multi-section analytical summaries, column breakdowns, missing value analyses, and correlation overviews.
- **Conversational Intelligence**: Maintains state-aware chats where users can query specific anomalies, ask statistical questions, and instruct the agent to build new visualizations.
- **Guided Visualizations**: Instructs the LLM via `data/prompts.json` to embed specific `/viz/image/...` links in the chat stream, which the React app instantly intercepts and displays as custom statistical cards.

### 🛡️ 4. Bulletproof Local-RAM Failback & Sandbox Simulator
If API credentials (`HUGGINGFACE_API_KEY`, `FIREBASE_CREDENTIALS_PATH`) are missing or the Firebase Cloud Database is unprovisioned, Juda remains fully operational:
- **Mockup RAM Mode**: Logs system diagnostics and automatically swaps database persistence to a thread-safe local in-memory RAM cache.
- **Frontend Sandbox**: Features a high-fidelity sandbox client preloaded with synthetic marketing dataset metadata, allowing full chat and visualization test runs offline.

---

## 📂 Project Directory Structure

### 💻 Backend (`backend/`)
* **`app/main.py`**: Uvicorn ASGI bootstrap, registers CORS middlewares, and sets up routing under `/api/v1`.
* **`app/config.py`**: Manages environment variables and API keys via `python-dotenv`.
* **`app/api/endpoints/`**:
  * `eda.py`: Exposes CSV upload handles (`/eda/upload`), statistics profiles (`/eda/summary`), and report requests (`/eda/report`).
  * `chat.py`: Directs active chat queries (`/chat/{id}`), session histories, and deep message collection purging (`DELETE /chat/history/{id}`).
  * `viz.py`: Streams interactive analytical visual heatmaps and charts as PNG buffers or Base64 JSON strings.
* **`app/services/`**:
  * `eda_service.py`: Computes custom dataset shapes, type identification, null rates, and descriptive metrics.
  * `viz_service.py`: Spawns thread-safe Seaborn/Matplotlib plots (correlation heatmaps, numerical distributions, null counts).
  * `llm_service.py`: Manages HF Llama-3.1-8B interfaces, LCEL conversational workflows, and stateless context prompts.
  * `firebase_service.py`: Interfaces with Google Cloud Firestore database.
* **`data/prompts.json`**: Standardized system templates, visual link schemas, and report specifications.

### 🎨 Frontend (`frontend/`)
* **`src/main.jsx` & `src/App.jsx`**: Global React mount coordinates. Manages multi-view landing/workspace routing, active session registries, and global state tables.
* **`src/index.css`**: Alabaster Studio style tokens, custom box shadows, dot meshes, and flex layouts.
* **`src/services/api.js`**: Reusable REST API network abstraction layer.
* **`src/components/`**:
  * `SaaSLandingPage.jsx`: B2B landing page with sticky navbar, pipeline maps, responsive mock previews, and founder social cards.
  * `HistorySidebar.jsx`: ChatGPT-style collapsible panel with in-memory status badges, clean delete drawers, and routing buttons.
  * `Dropzone.jsx`: Drag-and-drop CSV uploader with layout guides, validator alerts, and sandbox triggers.
  * `ChatBot.jsx`: Dual-pane chatbot chat frame, markdown image parser, and lightboxes.

---

## 🚀 Quick Start & Installation

To run both the backend and frontend services locally, follow the steps below.

### 1. Requirements
Ensure you have the following installed on your machine:
- **Python**: version `3.10` or above
- **Node.js**: version `18` or above
- **uv** (recommended Python package manager)

---

### 💻 2. Setting up the Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Copy the sample environment file and configure your API credentials:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to supply `HUGGINGFACE_API_KEY` and optional database keys.*

3. Install required packages and set up your virtual environment:
   ```bash
   uv sync
   ```

4. Start the FastAPI development server:
   ```bash
   .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *Access the interactive API docs at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

5. *(Optional)* Run automated test suites:
   ```bash
   uv run python -m pytest
   ```

---

### 🎨 3. Setting up the Frontend

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to: [http://localhost:5173/](http://localhost:5173/)*

4. Compile and bundle for production:
   ```bash
   npm run build
   ```

---

## ☁️ Setting Up Cloud Firestore
To provision Cloud Firestore in your GCP project (e.g., `juda-497014`):
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Select or create your project.
3. Select **Build** -> **Firestore Database** and choose **Create database**.
4. Set location, choose security rules, and click **Create** to initialize your cloud instance.

---

## ⚖️ License
Licensed under the [MIT License](LICENSE).