"""Tests for the assignments module: CRUD, ownership, submit/resubmit."""
from fastapi.testclient import TestClient


ASSIGNMENT_PAYLOAD = {
    "title": "My Cool Project",
    "description": "A simple FastAPI app",
    "language": "Python",
    "source_type": "repo_link",
    "source_url_or_path": "https://github.com/example/repo",
}


def _create_assignment(client: TestClient, headers: dict[str, str], **overrides: object) -> dict:
    payload = {**ASSIGNMENT_PAYLOAD, **overrides}
    response = client.post("/api/v1/assignments", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()


class TestCreateAssignment:
    def test_create_assignment_success(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        body = _create_assignment(client, auth_headers)
        assert body["title"] == ASSIGNMENT_PAYLOAD["title"]
        assert body["status"] == "draft"
        assert body["source_type"] == "repo_link"

    def test_create_assignment_unauthenticated(self, client: TestClient) -> None:
        response = client.post("/api/v1/assignments", json=ASSIGNMENT_PAYLOAD)
        assert response.status_code == 401


class TestListAssignments:
    def test_list_only_own_assignments(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
    ) -> None:
        _create_assignment(client, auth_headers, title="Mine 1")
        _create_assignment(client, auth_headers, title="Mine 2")
        _create_assignment(client, other_auth_headers, title="Not Mine")

        response = client.get("/api/v1/assignments", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 2
        titles = {item["title"] for item in body["items"]}
        assert titles == {"Mine 1", "Mine 2"}

    def test_list_empty(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        response = client.get("/api/v1/assignments", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == {"total": 0, "items": []}


class TestGetAssignment:
    def test_get_own_assignment(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        response = client.get(f"/api/v1/assignments/{created['id']}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_get_other_users_assignment_404(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
    ) -> None:
        created = _create_assignment(client, other_auth_headers)
        response = client.get(f"/api/v1/assignments/{created['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_get_nonexistent_assignment_404(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        response = client.get("/api/v1/assignments/99999", headers=auth_headers)
        assert response.status_code == 404


class TestUpdateAssignment:
    def test_update_own_assignment(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        response = client.put(
            f"/api/v1/assignments/{created['id']}",
            json={"title": "Renamed Title"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Renamed Title"

    def test_update_other_users_assignment_404(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
    ) -> None:
        created = _create_assignment(client, other_auth_headers)
        response = client.put(
            f"/api/v1/assignments/{created['id']}",
            json={"title": "Hijacked"},
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestDeleteAssignment:
    def test_delete_own_assignment(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        response = client.delete(f"/api/v1/assignments/{created['id']}", headers=auth_headers)
        assert response.status_code == 204

        get_response = client.get(f"/api/v1/assignments/{created['id']}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_delete_other_users_assignment_404(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
    ) -> None:
        created = _create_assignment(client, other_auth_headers)
        response = client.delete(f"/api/v1/assignments/{created['id']}", headers=auth_headers)
        assert response.status_code == 404


class TestSubmitAssignment:
    def test_submit_draft_success(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        response = client.post(f"/api/v1/assignments/{created['id']}/submit", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "submitted"

    def test_submit_already_submitted_error(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        client.post(f"/api/v1/assignments/{created['id']}/submit", headers=auth_headers)

        response = client.post(f"/api/v1/assignments/{created['id']}/submit", headers=auth_headers)
        assert response.status_code == 422


class TestResubmitAssignment:
    def test_resubmit_after_submit(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        client.post(f"/api/v1/assignments/{created['id']}/submit", headers=auth_headers)

        response = client.post(
            f"/api/v1/assignments/{created['id']}/resubmit",
            json={"source_url_or_path": "https://github.com/example/repo-v2"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "submitted"
        assert body["source_url_or_path"] == "https://github.com/example/repo-v2"

    def test_resubmit_draft_error(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        created = _create_assignment(client, auth_headers)
        response = client.post(
            f"/api/v1/assignments/{created['id']}/resubmit",
            json={"source_url_or_path": "https://github.com/example/repo-v2"},
            headers=auth_headers,
        )
        assert response.status_code == 422
