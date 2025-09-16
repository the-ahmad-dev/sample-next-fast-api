import os
from typing import List

from pydantic import computed_field
from pydantic_core import Url
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

    # Database Configuration
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "change-this")
    DB_NAME: str = os.getenv("DB_NAME", "sample_app_db")

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

    @computed_field
    @property
    def database_url(self) -> str:
        """Build the database URL."""
        return str(
            Url.build(
                scheme="postgresql",
                username=self.DB_USER,
                password=self.DB_PASSWORD,
                host=self.DB_HOST,
                port=self.DB_PORT,
                path=self.DB_NAME,
            )
        )

    model_config = {
        "env_file": os.path.join(os.path.dirname(__file__), "../../.env"),
        "case_sensitive": True,
        "env_parse_none_str": "None",
        "env_nested_delimiter": "__",
    }


# Global settings instance
settings = Settings()
