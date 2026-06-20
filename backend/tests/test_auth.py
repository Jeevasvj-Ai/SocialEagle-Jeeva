"""Tests for the auth module: register, login, me, refresh, logout."""
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.jwt import hash_refresh_token
from app.models.refresh_token import RefreshToken
from app.models.user import User


class TestRegister:
    def test_register_success(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "new@example.com", "password": "password123", "full_name": "New User"},
        )
        assert response.status_code == 201
        body = response.json()
        assert body["email"] == "new@example.com"
        assert body["full_name"] == "New User"
        assert "hashed_password" not in body

    def test_register_duplicate_email_conflict(self, client: TestClient, test_user: User) -> None:
        response = client.post(
            "/api/v1/auth/register",
            json={"email": test_user.email, "password": "password123"},
        )
        assert response.status_code == 409

    def test_register_password_too_short_validation_error(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "short@example.com", "password": "short"},
        )
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client: TestClient, test_user: User) -> None:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "password123"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"

    def test_login_wrong_password(self, client: TestClient, test_user: User) -> None:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "wrong-password"},
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "doesnotexist@example.com", "password": "password123"},
        )
        assert response.status_code == 401

    def test_login_inactive_user(self, client: TestClient, db: Session, test_user: User) -> None:
        test_user.is_active = False
        db.add(test_user)
        db.commit()

        response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "password123"},
        )
        assert response.status_code == 401


class TestMe:
    def test_me_authenticated(self, client: TestClient, auth_headers: dict[str, str], test_user: User) -> None:
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["email"] == test_user.email

    def test_me_unauthenticated(self, client: TestClient) -> None:
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_me_invalid_token(self, client: TestClient) -> None:
        response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
        assert response.status_code == 401

    def test_update_me(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        response = client.put(
            "/api/v1/auth/me",
            json={"full_name": "Updated Name"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["full_name"] == "Updated Name"


class TestRefreshAndLogout:
    def test_refresh_token_success(self, client: TestClient, test_user: User) -> None:
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "password123"},
        )
        refresh_token = login_response.json()["refresh_token"]

        response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert "refresh_token" in body
        # Rotation: the new refresh token should differ from the old one.
        assert body["refresh_token"] != refresh_token

    def test_refresh_token_invalid(self, client: TestClient) -> None:
        response = client.post("/api/v1/auth/refresh", json={"refresh_token": "garbage-token"})
        assert response.status_code == 401

    def test_refresh_token_already_revoked(self, client: TestClient, test_user: User) -> None:
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "password123"},
        )
        refresh_token = login_response.json()["refresh_token"]

        # First refresh rotates (revokes) the original token.
        client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})

        # Reusing the now-revoked token must fail.
        response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert response.status_code == 401

    def test_logout_revokes_token(self, client: TestClient, db: Session, test_user: User) -> None:
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "password123"},
        )
        refresh_token = login_response.json()["refresh_token"]

        response = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
        assert response.status_code == 204

        db_token = (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == hash_refresh_token(refresh_token))
            .first()
        )
        assert db_token is not None
        assert db_token.revoked is True

        # The revoked token can no longer be used to refresh.
        refresh_response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert refresh_response.status_code == 401

    def test_logout_unknown_token_not_found(self, client: TestClient) -> None:
        response = client.post("/api/v1/auth/logout", json={"refresh_token": "unknown-token"})
        assert response.status_code == 404
