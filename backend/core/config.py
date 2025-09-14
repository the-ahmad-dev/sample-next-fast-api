import os
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    PROJECT_NAME: str
    VERSION: str
    DEBUG: bool

    # API Configuration
    API_PREFIX: str

    # CORS Configuration
    CORS_ORIGINS: str
    CORS_ALLOW_CREDENTIALS: bool
    CORS_ALLOW_METHODS: str
    CORS_ALLOW_HEADERS: str

    # Server Configuration
    HOST: str
    PORT: int
    RELOAD: bool

    # Request Limits
    MAX_REQUEST_SIZE: int = 10 * 1024 * 1024  # 10MB default

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    @property
    def cors_methods_list(self) -> List[str]:
        """Parse comma-separated CORS methods into a list."""
        return [
            method.strip()
            for method in self.CORS_ALLOW_METHODS.split(",")
            if method.strip()
        ]

    model_config = {
        "env_file": os.path.join(os.path.dirname(__file__), "../../.env"),
        "case_sensitive": True,
        "env_parse_none_str": "None",
        "env_nested_delimiter": "__",
    }


# Global settings instance
settings = Settings()
