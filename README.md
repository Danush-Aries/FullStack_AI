# FullStack AI

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)
![License](https://img.shields.io/badge/License-MIT-green)

A production-ready fullstack AI chat application with a **FastAPI** backend, **streaming responses** via Server-Sent Events, and a clean dark-mode frontend — all served from a single Python process.

---

## What It Does

FullStack AI provides a ChatGPT-style conversational interface powered by any OpenAI model. You type a message, the backend forwards it to the OpenAI API, and the AI response streams back token-by-token directly to your browser — no page reloads, no waiting for the full response.

---

## Features

- **Streaming chat** — token-by-token SSE streaming so responses appear instantly
- **Conversation history** — multiple concurrent chats tracked in the sidebar
- **Markdown rendering** — code blocks, inline code, bold, and italic formatting
- **Suggestion chips** — one-click starter prompts on the welcome screen
- **REST API** — `/api/chat` (full) and `/api/chat/stream` (SSE) endpoints
- **Health endpoint** — `/api/health` for uptime monitoring
- **Configurable** — model, temperature, and token limit via `.env`
- **Responsive** — mobile-friendly layout, sidebar hides on small screens
- **Dark mode UI** — minimal, accessible design with a purple accent theme

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI | OpenAI Python SDK (`gpt-4o-mini` default) |
| Frontend | Vanilla HTML/CSS/JS (zero dependencies) |
| Templating | Jinja2 |
| Config | Pydantic Settings + `.env` |

---

## Project Structure

```
FullStack_AI/
├── backend/
│   └── app/
│       ├── main.py          # FastAPI app, mounts static files & templates
│       ├── config.py        # Settings loaded from .env
│       ├── models.py        # Pydantic request/response schemas
│       └── routers/
│           ├── chat.py      # /api/chat and /api/chat/stream
│           └── health.py    # /api/health
├── frontend/
│   ├── templates/
│   │   └── index.html       # Single-page chat UI
│   └── static/
│       ├── css/style.css    # Dark-mode stylesheet
│       └── js/app.js        # Streaming client, state management
├── run.py                   # Convenience launcher
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Installation

### Prerequisites

- Python 3.11 or later
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Dhanush-Aries/FullStack_AI.git
cd FullStack_AI

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Open .env and set your OPENAI_API_KEY
```

---

## Configuration

Edit `.env` (copy from `.env.example`):

```env
OPENAI_API_KEY=sk-...your-key-here...
OPENAI_MODEL=gpt-4o-mini      # or gpt-4o, gpt-3.5-turbo, etc.
MAX_TOKENS=1024
TEMPERATURE=0.7
DEBUG=false
```

---

## Usage

### Start the server

```bash
python run.py
```

Then open your browser at [http://localhost:8000](http://localhost:8000).

### API Examples

**Non-streaming chat:**

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is a transformer model?"}
    ]
  }'
```

Response:
```json
{
  "reply": "A transformer model is a deep learning architecture ...",
  "model": "gpt-4o-mini",
  "usage": {"prompt_tokens": 14, "completion_tokens": 120, "total_tokens": 134}
}
```

**Streaming chat (SSE):**

```bash
curl -N -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Write a haiku about Python."}
    ]
  }'
```

Output (streamed):
```
data: {"token": "Indent"}
data: {"token": "ed"}
data: {"token": " lines"}
...
data: [DONE]
```

**Health check:**

```bash
curl http://localhost:8000/api/health
# {"status": "ok", "version": "1.0.0"}
```

### Python SDK usage

```python
import httpx

with httpx.Client() as client:
    response = client.post(
        "http://localhost:8000/api/chat",
        json={
            "messages": [{"role": "user", "content": "Hello!"}],
            "model": "gpt-4o-mini",
        },
    )
    print(response.json()["reply"])
```

---

## Development

```bash
# Run with hot-reload (already enabled in run.py)
python run.py

# Run tests
pip install pytest pytest-asyncio httpx
pytest

# Lint
pip install ruff
ruff check backend/
```

---

## License

This project is licensed under the **MIT License**.

---

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) — the ASGI framework
- [OpenAI Python SDK](https://github.com/openai/openai-python) — API client
- [Uvicorn](https://www.uvicorn.org/) — lightning-fast ASGI server
