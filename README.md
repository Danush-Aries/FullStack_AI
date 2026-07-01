# FullStack AI

**FastAPI + a dark chat UI, streaming from any OpenAI-compatible model, one process.**

<!-- hero: 1600x600 screenshot of the streaming chat UI mid-response -->

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

A production-ready fullstack AI chat boilerplate. FastAPI backend, Server-Sent-Events token streaming, a clean dark-mode frontend, and full markdown rendering — all served from one Python process. Clone, add an API key, deploy.

---

## Why this exists

Every "AI chat starter template" I found was either a Next.js monorepo with 400 dependencies or a 20-line Flask snippet that couldn't stream. FullStack AI is the middle path — a single `run.py`, SSE streaming that actually works, markdown/code-block rendering baked in, a real dark-mode UI, and nothing you don't need. Meant to be forked as the first commit of your next AI product.

---

## Try it in 60 seconds

```bash
git clone https://github.com/Danush-Aries/FullStack_AI
cd FullStack_AI
pip install -r requirements.txt

cp .env.example .env
# add OPENAI_API_KEY=sk-...

python run.py
```

Open http://localhost:8000 and type. Responses stream token-by-token.

---

## How it works

```
Browser (dark-mode UI)
   |
   | POST /api/chat/stream
   v
FastAPI
   |
   | AsyncOpenAI stream
   v
OpenAI (any model)
   |
   | SSE tokens
   v
Browser renders markdown live
```

Endpoints:
- `POST /api/chat` — full response (blocking)
- `POST /api/chat/stream` — SSE token stream
- `GET /api/health` — uptime probe

---

## Screenshots

<!-- screenshot: chat-streaming.png -->
<!-- screenshot: sidebar-history.png -->

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + Uvicorn |
| LLM | AsyncOpenAI (any OpenAI-compatible endpoint) |
| Transport | Server-Sent Events (SSE) |
| Frontend | Vanilla JS, no build step |
| Rendering | Markdown + code blocks + inline formatting |
| Config | `.env` — model, temperature, tokens |

---

## More from Danush

Part of a broader stack of AI + security tooling:

- [jarvis](https://github.com/Danush-Aries/jarvis) — portable multi-provider AI assistant (voice/web/CLI)
- [breachintel](https://github.com/Danush-Aries/breachintel) — OSINT breach intelligence aggregator
- [cve-advisor](https://github.com/Danush-Aries/cve-advisor) — AI-powered CVE triage and patch recommendation
- [llm-fragility-lab](https://github.com/Danush-Aries/llm-fragility-lab) — adversarial testing lab for LLM robustness
- [network-intrusion-analyzer](https://github.com/Danush-Aries/network-intrusion-analyzer) — Suricata + Claude AI intrusion triage
- [autonomous-coding-agent](https://github.com/Danush-Aries/autonomous-coding-agent) — two-agent autonomous coding system

Built by [Dhanush](https://github.com/Danush-Aries) — AI engineering + cybersecurity.

## License

MIT.
