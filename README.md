# Apex Growth OS — Netskope

AI-powered sales operating system for Netskope enterprise sales teams.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Python 3.12 + FastAPI + Anthropic SDK |
| AI | Claude (via Anthropic API) |
| Auth | Firebase Auth (emulator for local dev) |
| Database | PostgreSQL + pgvector (via Docker) |

---

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — Python package manager
- Docker Desktop (optional)

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY to your real key
```

### 2. Start Docker services (optional)

```bash
docker compose up -d
# Postgres :5432, Redis :6379, Firestore emulator :8080
```

Skip this if you only need the UI — `SKIP_AUTH=true` in `.env` means no emulators required.

### 3. Start the backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health` → `{"status":"ok"}`

### 4. Start the frontend

```bash
# From project root
npm install
npm run dev
# App at http://localhost:3000
```

---

## AI Features (Claude)

| Component | Intent | What it does |
|---|---|---|
| Hunter Agent | `hunter` | Executes 11-item Hunter Playbook for account research |
| Competitive Intel Bot | `comp_intel` | SASE competitive analysis vs Zscaler/PANW |
| Deal Form NLP | `deal_parse` | Parses spoken/typed deal descriptions into MEDPICC fields |
| Outreach Modal | `outreach` | Generates personalized email + LinkedIn messages |
| Meetings Manager | `meeting` | Drafts meeting invites, tracks outcomes |

All AI calls route through `POST /api/chat/stream` (SSE). The browser never calls Anthropic directly.

---

## Architecture

```
browser → Vite dev proxy → FastAPI :8000 → Anthropic API (Claude)
```

---

## Key Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Your Claude API key |
| `SKIP_AUTH` | No | `true` bypasses Firebase auth (default for local) |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `ENVIRONMENT` | No | `local` or `production` |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── config.py             # Pydantic settings
│   │   ├── agents/
│   │   │   ├── orchestrator.py   # Anthropic streaming
│   │   │   ├── subagents.py      # Netskope system prompts per intent
│   │   │   └── hooks.py          # Audit logging
│   │   ├── api/chat.py           # SSE endpoint
│   │   └── middleware/
│   └── db/init.sql
├── src/
│   ├── components/               # React UI
│   ├── hooks/useAgentStream.ts   # SSE streaming hook
│   └── lib/
│       ├── api.ts                # queryAgent() helper
│       └── firebase.ts           # Firebase Auth client
├── docker-compose.yml
└── .env.example
```
