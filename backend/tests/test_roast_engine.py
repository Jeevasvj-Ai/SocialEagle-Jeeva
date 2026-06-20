"""Unit tests for app.services.roast_engine: LLM call + response parsing.

These exercise the engine directly (mocking httpx.AsyncClient) rather than
through the API layer, to cover the parsing/validation branches that
test_roasts.py intentionally bypasses by mocking generate_roast wholesale.
"""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.exceptions import ValidationError
from app.models.assignment import Assignment, SourceType
from app.services import roast_engine


def _make_assignment() -> Assignment:
    return Assignment(
        id=1,
        student_id=1,
        title="Test Project",
        description="A test",
        language="Python",
        source_type=SourceType.repo_link,
        source_url_or_path="https://github.com/example/repo",
    )


def _mock_llm_response(content: str) -> MagicMock:
    response = MagicMock()
    response.raise_for_status = MagicMock()
    response.json.return_value = {"choices": [{"message": {"content": content}}]}
    return response


class TestParseLlmPayload:
    def test_valid_payload(self) -> None:
        raw = '{"score": 80, "feedback_text": "Nice work", "severity": "low", "categories": ["style"]}'
        result = roast_engine._parse_llm_payload(raw)
        assert result["score"] == 80
        assert result["severity"] == "low"

    def test_strips_markdown_fences(self) -> None:
        raw = '```json\n{"score": 50, "feedback_text": "ok", "severity": "medium", "categories": []}\n```'
        result = roast_engine._parse_llm_payload(raw)
        assert result["score"] == 50

    def test_no_json_object_raises(self) -> None:
        with pytest.raises(ValidationError):
            roast_engine._parse_llm_payload("no json here")

    def test_invalid_json_raises(self) -> None:
        with pytest.raises(ValidationError):
            roast_engine._parse_llm_payload("{not valid json}")

    def test_score_out_of_range_raises(self) -> None:
        raw = '{"score": 150, "feedback_text": "ok", "severity": "low", "categories": []}'
        with pytest.raises(ValidationError):
            roast_engine._parse_llm_payload(raw)

    def test_missing_feedback_text_raises(self) -> None:
        raw = '{"score": 50, "feedback_text": "", "severity": "low", "categories": []}'
        with pytest.raises(ValidationError):
            roast_engine._parse_llm_payload(raw)

    def test_invalid_severity_raises(self) -> None:
        raw = '{"score": 50, "feedback_text": "ok", "severity": "extreme", "categories": []}'
        with pytest.raises(ValidationError):
            roast_engine._parse_llm_payload(raw)

    def test_categories_not_list_of_strings_raises(self) -> None:
        raw = '{"score": 50, "feedback_text": "ok", "severity": "low", "categories": [1, 2]}'
        with pytest.raises(ValidationError):
            roast_engine._parse_llm_payload(raw)


class TestGenerateRoast:
    @pytest.mark.asyncio
    async def test_generate_roast_success(self) -> None:
        assignment = _make_assignment()
        content = '{"score": 70, "feedback_text": "Decent", "severity": "medium", "categories": ["tests"]}'
        mock_response = _mock_llm_response(content)

        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None

        with patch("httpx.AsyncClient", return_value=mock_client):
            result = await roast_engine.generate_roast(assignment)

        assert result["score"] == 70
        assert result["severity"] == "medium"
        assert result["categories"] == ["tests"]

    @pytest.mark.asyncio
    async def test_generate_roast_malformed_response_shape_raises(self) -> None:
        assignment = _make_assignment()
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {"unexpected": "shape"}

        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None

        with patch("httpx.AsyncClient", return_value=mock_client):
            with pytest.raises(ValidationError):
                await roast_engine.generate_roast(assignment)

    @pytest.mark.asyncio
    async def test_generate_roast_http_error_raises(self) -> None:
        import httpx

        assignment = _make_assignment()

        mock_client = AsyncMock()
        mock_client.post = AsyncMock(side_effect=httpx.ConnectError("connection failed"))
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None

        with patch("httpx.AsyncClient", return_value=mock_client):
            with pytest.raises(ValidationError):
                await roast_engine.generate_roast(assignment)
