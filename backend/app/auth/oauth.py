"""Google OAuth helper functions: authorization URL + code exchange."""
import logging
from urllib.parse import urlencode

import httpx

from app.config import settings
from app.exceptions import UnauthorizedError

logger = logging.getLogger(__name__)

GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"


def build_google_auth_url(redirect_uri: str, state: str | None = None) -> str:
    """Build the URL that redirects the user to Google's consent screen."""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    if state:
        params["state"] = state
    return f"{GOOGLE_AUTH_ENDPOINT}?{urlencode(params)}"


async def exchange_code_for_user_info(code: str, redirect_uri: str) -> dict[str, str]:
    """Exchange an authorization code for the Google user's profile info.

    Performs the authorization-code-grant token exchange, then uses the
    resulting access token to fetch the user's profile (email, name, etc.).
    Raises UnauthorizedError if either step fails.
    """
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_ENDPOINT,
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
        )
        if token_response.status_code != httpx.codes.OK:
            logger.warning("Google token exchange failed: %s", token_response.text)
            raise UnauthorizedError("Failed to exchange authorization code with Google")

        token_data = token_response.json()
        google_access_token = token_data.get("access_token")
        if not google_access_token:
            logger.warning("Google token response missing access_token: %s", token_data)
            raise UnauthorizedError("Google did not return an access token")

        userinfo_response = await client.get(
            GOOGLE_USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        if userinfo_response.status_code != httpx.codes.OK:
            logger.warning("Google userinfo fetch failed: %s", userinfo_response.text)
            raise UnauthorizedError("Failed to fetch user info from Google")

        return userinfo_response.json()
