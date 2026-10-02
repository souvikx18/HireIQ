import json
import time
from typing import Dict, Any, Optional
from ai_service.core.config import settings
from ai_service.core.logging import logger
from ai_service.core.exceptions import AIProviderError

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class GeminiService:
    """Manages Google Generative AI interactions with retries, timeouts, and JSON extraction."""

    def __init__(self):
        self._initialized = False
        self._setup_client()

    def _setup_client(self):
        if not GENAI_AVAILABLE:
            logger.warning("google.generativeai package is not installed; Gemini LLM features disabled.")
            return

        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._initialized = True
                logger.info("Google Gemini AI client configured successfully.")
            except Exception as e:
                logger.error(f"Failed to configure Gemini AI: {str(e)}")

    @property
    def is_available(self) -> bool:
        return self._initialized and bool(settings.GEMINI_API_KEY)

    def generate_json_response(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Invokes Gemini and reliably parses JSON output with automatic retries."""
        if not self.is_available:
            return None

        models_to_try = [settings.GEMINI_MODEL, settings.GEMINI_FALLBACK_MODEL, "gemini-1.5-flash-latest"]
        last_error = None

        for model_name in models_to_try:
            for attempt in range(1, settings.GEMINI_MAX_RETRIES + 1):
                try:
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        system_instruction=system_instruction,
                        generation_config={"response_mime_type": "application/json", "temperature": 0.2},
                    )
                    response = model.generate_content(prompt)
                    if response and response.text:
                        parsed = json.loads(response.text.strip())
                        return parsed
                except json.JSONDecodeError as json_err:
                    logger.warning(f"Gemini output not valid JSON on {model_name} (attempt {attempt}): {json_err}")
                except Exception as e:
                    last_error = e
                    logger.warning(
                        f"Gemini call failed with model {model_name} (attempt {attempt}/{settings.GEMINI_MAX_RETRIES}): {str(e)}"
                    )
                    time.sleep(1.0 * attempt)
                    break  # Try next model

        logger.error(f"All Gemini model attempts exhausted: {str(last_error)}")
        return None

    def generate_chat_reply(self, messages: list, context: Optional[dict] = None) -> str:
        """Generates AI assistant conversation completions for the recruiter copilot."""
        if not self.is_available:
            return (
                "HireIQ AI Copilot is currently running in local deterministic mode. "
                "Configure GEMINI_API_KEY in your environment for live generative responses."
            )

        try:
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                system_instruction=(
                    "You are the HireIQ AI Recruitment Assistant, an elite talent acquisition expert. "
                    "Assist recruiters in evaluating candidates, drafting interview questions, "
                    "identifying skill gaps, and improving ATS compatibility scores. "
                    "Keep answers crisp, data-backed, and professional."
                ),
                generation_config={"temperature": 0.5, "max_output_tokens": 1000},
            )

            formatted_history = []
            for msg in messages[:-1]:
                role = "model" if msg.role == "assistant" else "user"
                formatted_history.append({"role": role, "parts": [msg.content]})

            chat = model.start_chat(history=formatted_history)
            latest_content = messages[-1].content
            if context:
                latest_content = f"Context: {json.dumps(context)}\n\nUser Question: {latest_content}"

            response = chat.send_message(latest_content)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini chat completion failed: {str(e)}")
            raise AIProviderError("Failed to generate response from Gemini AI. Please try again.")


gemini_service = GeminiService()
