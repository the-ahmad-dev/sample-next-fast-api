"""
Module registry for centralized API module management.
Provides dynamic module loading with lazy imports and enable/disable capability.
"""

from dataclasses import dataclass
from typing import List

from fastapi import APIRouter


@dataclass
class ModuleConfig:
    name: str
    router: APIRouter
    prefix: str
    tags: List[str]
    enabled: bool = True


MODULES = [
    ModuleConfig(
        name="health",
        router=lambda: __import__(
            "backend.modules.health.api", fromlist=["router"]
        ).router,
        prefix="",
        tags=["Health"],
    ),
    ModuleConfig(
        name="user",
        router=lambda: __import__(
            "backend.modules.user.api", fromlist=["router"]
        ).router,
        prefix="/user",
        tags=["Users"],
    ),
    ModuleConfig(
        name="two_fa",
        router=lambda: __import__(
            "backend.modules.two_fa.api", fromlist=["router"]
        ).router,
        prefix="/two_fa",
        tags=["TwoFA"],
    ),
    ModuleConfig(
        name="forgot_password",
        router=lambda: __import__(
            "backend.modules.forgot_password.api", fromlist=["router"]
        ).router,
        prefix="/forgot-password",
        tags=["Forgot Password"],
    ),
    ModuleConfig(
        name="book_demo",
        router=lambda: __import__(
            "backend.modules.book_demo.api", fromlist=["router"]
        ).router,
        prefix="/book-demo",
        tags=["Book Demo"],
    ),
]


def get_api_router() -> APIRouter:
    """Create and return the main API router with all registered modules."""
    api_router = APIRouter()

    for module in MODULES:
        if module.enabled:
            api_router.include_router(
                module.router(), prefix=module.prefix, tags=module.tags
            )

    return api_router
