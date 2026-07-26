# Token Optimizer

Welcome to the **Token Optimizer** project! This repository houses a cutting-edge, multi-layer AI pipeline designed to intelligently compress and optimize LLM prompts, alongside a full-stack CRM and Lead Generation platform.

## 🚀 Project Overview

The core of this project is the **5-Layer Token Optimizer Pipeline** which reduces token usage while maintaining cognitive alignment and deterministic execution for large language models (like Gemini 1.5 Pro). 

Additionally, the project features a comprehensive full-stack architecture designed for AI-driven lead generation, campaign management, and automated outreach via integrations like Gmail and LinkedIn.

### The 5-Layer Pipeline (`test.py`)
1. **Layer 1: Deterministic Ingestion & The τ-Threshold Router** (NFKC Normalization)
2. **Layer 2: Edge-Distributed XML Masking** (Lightweight NLP syntax targeting)
3. **Layer 3: SLM Pruning & Cognitive Alignment** (Aggressive distillation)
4. **Layer 4: Swarm Quantization & The HLMV** (Hierarchical Latent Memory Vault)
5. **Layer 4.5 & 5: Circuit Breaker & Flagship Execution** (Zero-latency verification and API execution)

## 🛠️ Technologies Used

### Frontend
- **React.js**: UI Library
- **Vite**: Frontend build tool and development server

### Backend & AI Agents
- **Node.js / Express**: Core backend API for the CRM (Controllers, Models, Routes)
- **Python / FastAPI**: AI Agent orchestrator (`agents/main.py`)
- **spaCy**: NLP library used for Edge-Distributed XML Masking

### Database & Infrastructure
- **SQL**: Database schema (`database/schema.sql`)
- **Docker**: Containerization and local environment setup (`docker/docker-compose.yml`)

### Integrations
- **Apollo, Gmail, HubSpot, LinkedIn**: Custom integrations for lead fetching and automated outreach.

## 📁 Project Structure

```text
TOKEN-OPTIMIZER/
├── agents/                  # Python FastAPI service for AI Agents & Orchestration
├── backend/                 # Node.js backend (Controllers, Routes, Models, Services)
├── database/                # SQL schemas and database configuration
├── docker/                  # Docker Compose configurations
├── frontend/                # React + Vite frontend application
├── integrations/            # 3rd-party service clients (Apollo, Gmail, HubSpot, LinkedIn)
├── prompts/                 # Text prompts for AI behavior (scoring, emails, research)
├── workers/                 # Background workers (email, followup, linkedin)
├── test.py                  # Core standalone implementation of the 5-Layer Token Optimizer
├── protected_operators.json # Configurations for quantization map
├── quantization_map.json    # HLMV Semantic tokens mappings
└── README.md                # Project documentation
```

## 🏃 How to Run the App

### 1. Running the 5-Layer Token Optimizer Pipeline (Standalone)
The standalone optimizer pipeline requires Python and `spaCy`.
```bash
# Install dependencies
pip install requests spacy fastapi uvicorn

# Download spaCy NLP model
python -m spacy download en_core_web_sm

# Run the optimizer terminal interface
python test.py
```

### 2. Running via Docker (Recommended for Full-Stack)
If you want to spin up the entire stack (Frontend, Node Backend, Python Agents, Database):
```bash
cd docker
docker-compose up --build
```
*(Note: Ensure Docker Desktop is running before executing this command.)*

### 3. Running Services Locally (Manual Setup)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Node.js Backend:**
```bash
cd backend
npm install
npm start   # or node server.js
```

**Python AI Agents API:**
```bash
cd agents
pip install fastapi uvicorn
uvicorn main:app --reload --port 8000
```

## 🤝 Contributing
Feel free to open issues or submit pull requests. Ensure that you test your changes thoroughly against the `test.py` pipeline.
