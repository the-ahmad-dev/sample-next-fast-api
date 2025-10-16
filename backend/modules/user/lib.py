"""
User module utility functions.
Provides helper functions for user-related operations and transformations.
"""

from backend.models import User, UserPublic


def user_to_public(user: User, pending_2fa: bool = False) -> UserPublic:
    """Convert User model to UserPublic with 2FA status."""
    two_fa_enabled = user.two_factor_auth.is_enabled if user.two_factor_auth else False

    return UserPublic(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        signup_verified=user.signup_verified,
        auth_provider=user.auth_provider,
        profile_picture=user.profile_picture,
        is_admin=user.is_admin,
        two_fa_enabled=two_fa_enabled,
        pending_2fa=pending_2fa,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
