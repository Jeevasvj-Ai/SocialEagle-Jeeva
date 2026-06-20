"""Tests for the roasts module: generation (LLM mocked), retrieval, ownership."""
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.services import roast_engine

MOCK_LLM_RESULT = {
    "score": 75,
    "feedback_text": "Solid effort, but your variable names need therapy.",
    "severity": "medium",
    "categories": ["naming", "structure"],
}


@pytest.fixture()
def mock_generate_roast(monkeypatch: pytest.MonkeyPatch) -> AsyncMock:
    """Patch roast_engine.generate_roast so no real LLM/HTTP call is made."""
    mock = AsyncMock(return_value=dict(MOCK_LLM_RESULT))
    monkeypatch.setattr(roast_engine, "generate_roast", mock)
    return mock


def _create_and_submit_assignment(client: TestClient, headers: dict[str, str]) -> dict:
    create_response = client.post(
        "/api/v1/assignments",
        json={
            "title": "Roastable Project",
            "description": "Needs roasting",
            "language": "Python",
            "source_type": "repo_link",
            "source_url_or_path": "https://github.com/example/roastable",
        },
        headers=headers,
    )
    assert create_response.status_code == 201
    assignment = create_response.json()

    submit_response = client.post(f"/api/v1/assignments/{assignment['id']}/submit", headers=headers)
    assert submit_response.status_code == 200
    return submit_response.json()


class TestTriggerRoast:
    def test_trigger_roast_success(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, auth_headers)

        response = client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)
        assert response.status_code == 201
        body = response.json()
        assert body["score"] == MOCK_LLM_RESULT["score"]
        assert body["severity"] == MOCK_LLM_RESULT["severity"]
        assert body["categories"] == MOCK_LLM_RESULT["categories"]
        assert body["assignment_id"] == assignment["id"]
        mock_generate_roast.assert_awaited_once()

        # Assignment should now be 'reviewed'.
        get_assignment = client.get(f"/api/v1/assignments/{assignment['id']}", headers=auth_headers)
        assert get_assignment.json()["status"] == "reviewed"

    def test_trigger_roast_on_draft_conflict(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        create_response = client.post(
            "/api/v1/assignments",
            json={
                "title": "Draft Project",
                "language": "Python",
                "source_type": "repo_link",
                "source_url_or_path": "https://github.com/example/draft",
            },
            headers=auth_headers,
        )
        draft = create_response.json()

        response = client.post(f"/api/v1/assignments/{draft['id']}/roast", headers=auth_headers)
        assert response.status_code == 409
        mock_generate_roast.assert_not_awaited()

    def test_trigger_roast_duplicate_conflict(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, auth_headers)
        first = client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)
        assert first.status_code == 201

        second = client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)
        assert second.status_code == 409

    def test_trigger_roast_other_users_assignment_404(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, other_auth_headers)

        response = client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)
        assert response.status_code == 404
        mock_generate_roast.assert_not_awaited()


class TestGetRoast:
    def test_get_latest_roast_for_assignment(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, auth_headers)
        client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)

        response = client.get(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["assignment_id"] == assignment["id"]

    def test_get_roast_no_roast_yet_404(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        assignment = _create_and_submit_assignment(client, auth_headers)
        response = client.get(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers)
        assert response.status_code == 404

    def test_get_roast_by_id(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, auth_headers)
        created = client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=auth_headers).json()

        response = client.get(f"/api/v1/roasts/{created['id']}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_get_roast_by_id_other_user_404(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, other_auth_headers)
        created = client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=other_auth_headers).json()

        response = client.get(f"/api/v1/roasts/{created['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_get_roast_by_id_not_found(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        response = client.get("/api/v1/roasts/99999", headers=auth_headers)
        assert response.status_code == 404


class TestListRoasts:
    def test_list_roast_history(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment1 = _create_and_submit_assignment(client, auth_headers)
        client.post(f"/api/v1/assignments/{assignment1['id']}/roast", headers=auth_headers)

        response = client.get("/api/v1/roasts", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1
        assert len(body["items"]) == 1

    def test_list_roast_history_scoped_to_user(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
        mock_generate_roast: AsyncMock,
    ) -> None:
        assignment = _create_and_submit_assignment(client, other_auth_headers)
        client.post(f"/api/v1/assignments/{assignment['id']}/roast", headers=other_auth_headers)

        response = client.get("/api/v1/roasts", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == {"total": 0, "items": []}

    def test_list_roast_history_empty(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        response = client.get("/api/v1/roasts", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == {"total": 0, "items": []}
