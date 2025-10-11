"""
Logging configuration and setup for the application.
Provides structured logging with customizable levels and formats.
"""

import logging
import logging.config
import sys
from typing import Any, Dict

from .config import settings


def setup_logging() -> None:
    """Setup structured logging configuration."""
    if hasattr(setup_logging, "_configured"):
        return
    setup_logging._configured = True

    log_level = "DEBUG"

    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "level": log_level,
                "class": "logging.StreamHandler",
                "formatter": "standard",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console"],
                "level": log_level,
                "propagate": False,
            },
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "python_http_client": {
                "handlers": ["console"],
                "level": "WARNING",
                "propagate": False,
            },
            "asyncio": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }

    logging.config.dictConfig(logging_config)

    # Log startup
    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured for {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Log level: {log_level}")
