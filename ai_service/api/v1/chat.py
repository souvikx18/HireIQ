from fastapi import APIRouter, status, Depends
from ai_service.core.config import settings
from ai_service.core.security import verify_internal_api_key
from ai_service.core.logging import logger
from ai_service.schemas.chat import ChatCompletionRequest, ChatCompletionResponse
from ai_service.services.gemini_service import gemini_service

router = APIRouter(prefix="/chat", tags=["Recruiter Copilot"])


@router.post(
    "/message",
    response_model=ChatCompletionResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_api_key)],
)
def copilot_chat(request: ChatCompletionRequest):
    """
    Handles recruiter AI assistant conversation messages, providing hiring intelligence,
    candidate summaries, and interview suggestions.
    """
    logger.info(f"Processing copilot chat turn ({len(request.messages)} messages in context)")
    reply_text = gemini_service.generate_chat_reply(
        messages=request.messages,
        context=request.context,
    )
    return ChatCompletionResponse(
        reply=reply_text,
        model=settings.GEMINI_MODEL if gemini_service.is_available else "local-deterministic",
    )
