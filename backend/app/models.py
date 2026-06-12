"""
Pydantic request/response models.
"""

from pydantic import BaseModel, Field
from typing import List, Literal


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., min_length=1)
    model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None


class ChatResponse(BaseModel):
    reply: str
    model: str
    usage: dict


class HealthResponse(BaseModel):
    status: str
    version: str
