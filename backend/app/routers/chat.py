"""
Chat router — handles AI conversation endpoints.
Supports both regular and streaming responses.
"""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, OpenAIError

from app.config import settings
from app.models import ChatRequest, ChatResponse

router = APIRouter()


def _get_client() -> AsyncOpenAI:
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.",
        )
    return AsyncOpenAI(api_key=settings.openai_api_key)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a conversation to the AI and receive a complete response."""
    client = _get_client()
    messages = [m.model_dump() for m in request.messages]

    try:
        response = await client.chat.completions.create(
            model=request.model or settings.openai_model,
            messages=messages,
            temperature=request.temperature or settings.temperature,
            max_tokens=request.max_tokens or settings.max_tokens,
        )
    except OpenAIError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    choice = response.choices[0]
    return ChatResponse(
        reply=choice.message.content or "",
        model=response.model,
        usage=response.usage.model_dump() if response.usage else {},
    )


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream the AI response token-by-token via Server-Sent Events."""
    client = _get_client()
    messages = [m.model_dump() for m in request.messages]

    async def event_generator():
        try:
            stream = await client.chat.completions.create(
                model=request.model or settings.openai_model,
                messages=messages,
                temperature=request.temperature or settings.temperature,
                max_tokens=request.max_tokens or settings.max_tokens,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    data = json.dumps({"token": delta.content})
                    yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        except OpenAIError as exc:
            error_data = json.dumps({"error": str(exc)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
