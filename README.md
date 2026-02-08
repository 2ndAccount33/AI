# AI Automation Platform

A practical AI-powered platform for education and career development, featuring a hybrid MERN stack (TypeScript) frontend and Python/FastAPI AI backend.

## 🚀 Features

### Three Core AI Agents

1. **Skill-Gap Roadmap Agent** - Analyzes resumes vs. job descriptions to create personalized learning paths with live resources
2. **Gamified Assessment Generator** - Creates interactive quests, quizzes, and boss battles from educational content
3. **Autonomous Career Aptitude Assistant** - Conducts adaptive AI-driven interviews with real-time feedback

### Key Capabilities

- 📊 Resume parsing and skill extraction
- 🎯 Semantic skill gap analysis
- 🎮 Gamified learning with XP and badges
- 💬 Real-time WebSocket communication
- 🔄 Feedback loop between agents
- 🎨 Modern glassmorphism UI

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  Node.js Backend │────▶│  Python AI Svc  │
│  React + TS  │     │  Express + JWT   │     │  FastAPI + LC   │
└──────────────┘     └──────────────────┘     └─────────────────┘
                              │                        │
                              ▼                        ▼
                     ┌──────────────┐         ┌──────────────┐
                     │   MongoDB    │         │   ChromaDB   │
                     └──────────────┘         └──────────────┘
```

## 📁 Project Structure

```
AI Agent/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── store/           # Zustand state
│   │   ├── services/        # API layer
│   │   ├── hooks/           # WebSocket hooks
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Mongoose models
│   │   ├── middleware/      # Auth, error handling
│   │   ├── services/        # AI service proxy
│   │   └── websocket/       # Socket.io handlers
│   └── package.json
├── ai-service/              # Python + FastAPI + LangChain
│   ├── app/
│   │   ├── routers/         # Agent endpoints
│   │   ├── tools/           # Parsing, search, content
│   │   └── models.py        # Pydantic models
│   └── requirements.txt
└── docker-compose.yml       # Full stack orchestration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Environment Setup

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env
   ```

2. Add your API keys to `.env`:
   ```
   OPENAI_API_KEY=your-openai-api-key
   TAVILY_API_KEY=your-tavily-api-key
   ```

### Running with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Running Locally

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📚 API Documentation

### Backend (Node.js) - Port 5000

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/roadmap/analyze` | POST | Analyze skill gap |
| `/api/assessment/generate` | POST | Generate assessment |
| `/api/aptitude/start` | POST | Start aptitude session |
| `/api/jobs` | GET | List job postings |

### AI Service (Python) - Port 8000

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/agents/skill-gap/analyze` | POST | Skill gap analysis |
| `/api/v1/agents/assessment/generate` | POST | Generate quests |
| `/api/v1/agents/aptitude/generate-question` | POST | Generate question |
| `/api/v1/agents/aptitude/evaluate` | POST | Evaluate response |

## 🔄 Feedback Loop

The platform implements a feedback loop between agents:

1. User completes **Aptitude Assessment**
2. **Agent 3** evaluates and identifies weaknesses
3. Weaknesses sent to **Agent 1** (Skill-Gap)
4. **Agent 1** generates new learning stages
5. User's roadmap is updated automatically

## 🎨 UI Components

- **MainLayout** - Sidebar navigation with XP display
- **Dashboard** - Quick stats and actions
- **RoadmapPage** - React Flow visualization
- **AssessmentPage** - Gamified quiz system
- **AptitudePage** - Real-time chat + Monaco editor
- **JobBoard** - Job search with filters

## 🔧 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state)
- React Query
- React Flow
- Socket.io Client
- Monaco Editor

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Socket.io
- JWT Authentication

### AI Service
- Python 3.11
- FastAPI
- LangChain + OpenAI
- ChromaDB
- Tavily Search

## 📄 License

MIT
