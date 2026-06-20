"""Tests for Google OAuth: redirect, code exchange, and login/register flow."""
from unittest.mock import AsyncMock, MagicMock, patch
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.oauth import build_google_auth_url, exchange_code_for_user_info
from app.exceptions import UnauthorizedError
from app.models.user import User


def _mock_response(status_code: int, json_body: dict) -> MagicMock:
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = json_body
    response.text = str(json_body)
    return response


def _mock_async_client(post_response: MagicMock, get_response: MagicMock) -> AsyncMock:
    mock_client = AsyncMock()
    mock_client.post = AsyncMock(return_value=post_response)
    mock_client.get = AsyncMock(return_value=get_response)
    mock_client.__aenter__.return_value = mock_client
    mock_client.__aexit__.return_value = None
    return mock_client


class TestBuildGoogleAuthUrl:
    def test_includes_required_params(self) -> None:
        url = build_google_auth_url(redirect_uri="http://localhost:8000/api/v1/auth/google/callback")
        parsed = urlparse(url)
        params = parse_qs(parsed.query)

        assert parsed.netloc == "accounts.google.com"
        assert params["response_type"] == ["code"]
        assert params["redirect_uri"] == ["http://localhost:8000/api/v1/auth/google/callback"]
        assert "client_id" in params

    def test_includes_state_when_provided(self) -> None:
        url = build_google_auth_url(redirect_uri="http://localhost:8000/cb", state="xyz123")
        params = parse_qs(urlparse(url).query)
        assert params["state"] == ["xyz123"]


class TestExchangeCodeForUserInfo:
    @pytest.mark.asyncio
    async def test_success(self) -> None:
        post_resp = _mock_response(200, {"access_token": "google-access-token"})
        get_resp = _mock_response(200, {"email": "student@gmail.com", "name": "Google Student"})

        with patch("httpx.AsyncClient", return_value=_mock_async_client(post_resp, get_resp)):
            result = await exchange_code_for_user_info("auth-code", redirect_uri="http://cb")

        assert result["email"] == "student@gmail.com"
        assert result["name"] == "Google Student"

    @pytest.mark.asyncio
    async def test_token_exchange_failure_raises(self) -> None:
        post_resp = _mock_response(400, {"error": "invalid_grant"})
        get_resp = _mock_response(200, {})

        with patch("httpx.AsyncClient", return_value=_mock_async_client(post_resp, get_resp)):
            with pytest.raises(UnauthorizedError):
                await exchange_code_for_user_info("bad-code", redirect_uri="http://cb")

    @pytest.mark.asyncio
    async def test_missing_access_token_raises(self) -> None:
        post_resp = _mock_response(200, {"token_type": "bearer"})  # no access_token
        get_resp = _mock_response(200, {})

        with patch("httpx.AsyncClient", return_value=_mock_async_client(post_resp, get_resp)):
            with pytest.raises(UnauthorizedError):
                await exchange_code_for_user_info("code", redirect_uri="http://cb")

    @pytest.mark.asyncio
    async def test_userinfo_fetch_failure_raises(self) -> None:
        post_resp = _mock_response(200, {"access_token": "tok"})
        get_resp = _mock_response(401, {"error": "invalid_token"})

        with patch("httpx.AsyncClient", return_value=_mock_async_client(post_resp, get_resp)):
            with pytest.raises(UnauthorizedError):
                await exchange_code_for_user_info("code", redirect_uri="http://cb")


class TestGoogleLoginRedirect:
    def test_redirects_to_google(self, client: TestClient) -> None:
        response = client.get("/api/v1/auth/google", follow_redirects=False)
        assert response.status_code in (302, 307)
        assert "accounts.google.com" in response.headers["location"]


class TestGoogleCallback:
    def test_creates_new_oauth_user_and_issues_tokens(self, client: TestClient, db: Session) -> None:
        user_info = {"email": "newgoogleuser@gmail.com", "name": "New Google User"}
        with patch(
            "app.routers.auth.exchange_code_for_user_info",
            new=AsyncMock(return_value=user_info),
        ):
            response = client.get("/api/v1/auth/google/callback", params={"code": "valid-code"})

        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert "refresh_token" in body

        created = db.query(User).filter(User.email == "newgoogleuser@gmail.com").first()
        assert created is not None
        assert created.oauth_provider == "google"
        assert created.is_verified is True
        assert created.hashed_password is None

    def test_logs_in_existing_user_by_email(self, client: TestClient, db: Session, test_user: User) -> None:
        user_info = {"email": test_user.email, "name": test_user.full_name}
        with patch(
            "app.routers.auth.exchange_code_for_user_info",
            new=AsyncMock(return_value=user_info),
        ):
            response = client.get("/api/v1/auth/google/callback", params={"code": "valid-code"})

        assert response.status_code == 200
        # No duplicate user created for the same email.
        assert db.query(User).filter(User.email == test_user.email).count() == 1

    def test_missing_email_in_userinfo_raises_422(self, client: TestClient) -> None:
        user_info = {"name": "No Email User"}
        with patch(
            "app.routers.auth.exchange_code_for_user_info",
            new=AsyncMock(return_value=user_info),
        ):
            response = client.get("/api/v1/auth/google/callback", params={"code": "valid-code"})

        assert response.status_code == 422

    def test_exchange_failure_propagates_as_401(self, client: TestClient) -> None:
        with patch(
            "app.routers.auth.exchange_code_for_user_info",
            new=AsyncMock(side_effect=UnauthorizedError("Failed to exchange authorization code with Google")),
        ):
            response = client.get("/api/v1/auth/google/callback", params={"code": "bad-code"})

        assert response.status_code == 401
