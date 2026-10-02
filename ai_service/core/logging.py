import sys
import logging
from typing import Any, Dict
from ai_service.core.config import settings

LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
)


def setup_logging() -> logging.Logger:
    """Configures structured, level-controlled logging for production execution."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Root logger configuration
    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Silence excessively verbose third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("google.generativeai").setLevel(logging.INFO)

    logger = logging.getLogger("hireiq_ai")
    logger.setLevel(log_level)
    return logger


logger = setup_logging()
