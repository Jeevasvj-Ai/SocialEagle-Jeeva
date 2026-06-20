"""Core roast-generation engine.

Calls an LLM chat-completions-style HTTP API to generate a witty but
constructive "roast" (scored review) of an assignment's submitted source
description. This module NEVER executes or eval()s submitted student code —
it only ever sends text (a prompt referencing the assignment's metadata and
source reference) to the LLM API and parses the LLM's text response.
"""
import json
import logging
import re
from typing import Any

import httpx

from app.config import settings
from app.exceptions import ValidationError
from app.models.assignment import Assignment
from app.models.roast import RoastSeverity

logger = logging.getLogger(__name__)

LLM_API_URL = "https://api.openai.com/v1/chat/completions"
LLM_MODEL = "gpt-4o-mini"
REQUEST_TIMEOUT_SECONDS = 60.0

_VALID_SEVERITIES = {s.value for s in RoastSeverity}

_SYSTEM_PROMPT = (
    "You are a witty but constructive senior code reviewer. You give student "
    "code submissions a humorous 'roast' that is still genuinely useful "
    "feedback. You NEVER execute, run, or simulate execution of any code — "
    "you only reason about it from the description/metadata you are given. "
    "You MUST respond with strict JSON only, no markdown fences, no prose "
    "outside the JSON object, matching exactly this shape: "
    '{"score": <int 0-100>, "feedback_text": <string>, '
    '"severity": <"low"|"medium"|"high">, "categories": [<string>, ...]}'
)


def _build_prompt(assignment: Assignment) -> str:
    """Build the user-facing prompt describing the assignment for the LLM.

    Only metadata/text is included — for repo_link submissions the URL is
    passed as a reference for the LLM to discuss conceptually, never cloned
    or fetched by this service.
    """
    return (
        f"Assignment title: {assignment.title}\n"
        f"Language: {assignment.language}\n"
        f"Description: {assignment.description or 'N/A'}\n"
        f"Source type: {assignment.source_type.value}\n"
        f"Source reference (URL or path, do not fetch/execute): "
        f"{assignment.source_url_or_path}\n\n"
        "Based on this information, write a witty but constructive roast of "
        "this submission. Respond with strict JSON only."
    )


def _extract_json_object(raw_text: str) -> str:
    """Extract the first top-level JSON object substring from raw LLM text.

    LLMs sometimes wrap JSON in markdown code fences or add stray prose.
    This grabs the substring between the first '{' and the last '}'.
    """
    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not match:
        raise ValidationError("LLM response did not contain a JSON object")
    return match.group(0)


def _parse_llm_payload(raw_text: str) -> dict[str, Any]:
    """Defensively parse and validate the LLM's JSON payload.

    Raises ValidationError (app.exceptions) on any malformed or
    out-of-contract response instead of letting the caller crash.
    """
    json_str = _extract_json_object(raw_text)

    try:
        payload = json.loads(json_str)
    except json.JSONDecodeError as exc:
        raise ValidationError(f"LLM response was not valid JSON: {exc}") from exc

    if not isinstance(payload, dict):
        raise ValidationError("LLM response JSON was not an object")

    score = payload.get("score")
    feedback_text = payload.get("feedback_text")
    severity = payload.get("severity")
    categories = payload.get("categories")

    if not isinstance(score, int) or isinstance(score, bool) or not (0 <= score <= 100):
        raise ValidationError("LLM response 'score' must be an integer between 0 and 100")

    if not isinstance(feedback_text, str) or not feedback_text.strip():
        raise ValidationError("LLM response 'feedback_text' must be a non-empty string")

    if not isinstance(severity, str) or severity not in _VALID_SEVERITIES:
        raise ValidationError(
            f"LLM response 'severity' must be one of {sorted(_VALID_SEVERITIES)}"
        )

    if not isinstance(categories, list) or not all(isinstance(c, str) for c in categories):
        raise ValidationError("LLM response 'categories' must be a list of strings")

    return {
        "score": score,
        "feedback_text": feedback_text,
        "severity": severity,
        "categories": categories,
    }


async def generate_roast(assignment: Assignment) -> dict[str, Any]:
    """Generate a roast for the given assignment via an LLM API call.

    This function only ever sends text prompts to an LLM HTTP API and parses
    the LLM's text response. It never executes, imports, or evaluates any
    student-submitted code.

    Args:
        assignment: The Assignment to roast. Must have status 'submitted'
            (caller is responsible for enforcing this).

    Returns:
        A dict with keys: score (int), feedback_text (str),
        severity (str), categories (list[str]).

    Raises:
        ValidationError: If the LLM response is missing, malformed, or
            fails validation against the expected JSON contract.
    """
    prompt = _build_prompt(assignment)

    request_body = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(LLM_API_URL, json=request_body, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        logger.error("LLM API call failed for assignment_id=%s: %s", assignment.id, exc)
        raise ValidationError(f"LLM API request failed: {exc}") from exc

    try:
        raw_text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        logger.error("Unexpected LLM API response shape for assignment_id=%s", assignment.id)
        raise ValidationError("LLM API response did not contain expected content") from exc

    result = _parse_llm_payload(raw_text)
    logger.info(
        "Generated roast for assignment_id=%s score=%s severity=%s",
        assignment.id,
        result["score"],
        result["severity"],
    )
    return result
