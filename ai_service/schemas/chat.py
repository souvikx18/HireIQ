from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=10000)


class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1)
    context: Optional[Dict[str, Any]] = Field(default=None, description="Candidate or Job context for the copilot")


class ChatCompletionResponse(BaseModel):
    reply: str
    model: str
