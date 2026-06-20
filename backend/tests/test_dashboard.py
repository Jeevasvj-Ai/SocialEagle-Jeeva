"""Tests for the dashboard module: summary stats scoped to the current user."""
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.services import roast_engine


def _create_and_submit(client: TestClient, headers: dict[str, str], title: str) -> dict:
    create_response = client.post(
        "/api/v1/assignments",
        json={
            "title": title,
            "language": "Python",
            "source_type": "repo_link",
            "source_url_or_path": "https://github.com/example/repo",
        },
        headers=headers,
    )
    assignment = create_response.json()
    submit_response = client.post(f"/api/v1/assignments/{assignment['id']}/submit", headers=headers)
    return submit_response.json()


class TestDashboardSummary:
    def test_summary_unauthenticated(self, client: TestClient) -> None:
        response = client.get("/api/v1/dashboard/summary")
        assert response.status_code == 401

    def test_summary_empty_for_new_user(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        response = client.get("/api/v1/dashboard/summary", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["total_assignments"] == 0
        assert body["by_status"] == {}
        assert body["average_score"] is None
        assert body["recent_roasts"] == []
        assert body["score_trend"] == []

    def test_summary_counts_by_status(self, client: TestClient, auth_headers: dict[str, str]) -> None:
        # One draft, one submitted.
        client.post(
            "/api/v1/assignments",
            json={
                "title": "Draft One",
                "language": "Python",
                "source_type": "repo_link",
                "source_url_or_path": "https://github.com/example/draft",
            },
            headers=auth_headers,
        )
        _create_and_submit(client, auth_headers, "Submitted One")

        response = client.get("/api/v1/dashboard/summary", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["total_assignments"] == 2
        assert body["by_status"] == {"draft": 1, "submitted": 1}

    def test_summary_average_score_and_recent_roasts(
        self, client: TestClient, auth_headers: dict[str, str], monkeypatch: pytest.MonkeyPatch
    ) -> None:
        results = [
            {"score": 60, "feedback_text": "Meh.", "severity": "medium", "categories": ["style"]},
            {"score": 90, "feedback_text": "Great!", "severity": "low", "categories": ["clean"]},
        ]
        mock = AsyncMock(side_effect=results)
        monkeypatch.setattr(roast_engine, "generate_roast", mock)

        assignment1 = _create_and_submit(client, auth_headers, "Assignment One")
        assignment2 = _create_and_submit(client, auth_headers, "Assignment Two")

        client.post(f"/api/v1/assignments/{assignment1['id']}/roast", headers=auth_headers)
        client.post(f"/api/v1/assignments/{assignment2['id']}/roast", headers=auth_headers)

        response = client.get("/api/v1/dashboard/summary", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()

        assert body["total_assignments"] == 2
        assert body["by_status"] == {"reviewed": 2}
        assert body["average_score"] == pytest.approx(75.0)
        assert len(body["recent_roasts"]) == 2
        assert len(body["score_trend"]) == 2
        scores = {point["score"] for point in body["score_trend"]}
        assert scores == {60, 90}

    def test_summary_scoped_to_current_user(
        self,
        client: TestClient,
        auth_headers: dict[str, str],
        other_auth_headers: dict[str, str],
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        mock = AsyncMock(
            return_value={"score": 50, "feedback_text": "Ok.", "severity": "medium", "categories": []}
        )
        monkeypatch.setattr(roast_engine, "generate_roast", mock)

        other_assignment = _create_and_submit(client, other_auth_headers, "Other's Assignment")
        client.post(f"/api/v1/assignments/{other_assignment['id']}/roast", headers=other_auth_headers)

        response = client.get("/api/v1/dashboard/summary", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["total_assignments"] == 0
        assert body["average_score"] is None
