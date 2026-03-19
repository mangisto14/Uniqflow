from typing import Any
from ..config import get_settings


async def get_ai_suggestion(
    point_id: str,
    point_label: str,
    fields: list[dict],
    field_values: dict[str, Any],
    process_context: dict[str, Any],
) -> dict[str, Any]:
    """Call AI provider and return structured guidance for the given point."""
    settings = get_settings()

    system_prompt = (
        "You are an assistant helping users fill out process inspection forms. "
        "Given the context of a process and a specific inspection point, provide helpful guidance. "
        "Respond ONLY with valid JSON in the exact format requested."
    )

    user_message = (
        f"Process context: {process_context}\n"
        f"Current point: {point_label} (id: {point_id})\n"
        f"Fields to fill: {fields}\n"
        f"Already filled values: {field_values}\n\n"
        "Return JSON with:\n"
        "{\n"
        '  "suggestion": "short actionable suggestion for this point",\n'
        '  "field_hints": {"field_name": "hint text"},\n'
        '  "warnings": ["list of warnings if any"],\n'
        '  "recommended_next_points": ["point_ids to visit next"]\n'
        "}"
    )

    if settings.ai_provider == "anthropic" and settings.anthropic_api_key:
        return await _call_anthropic(system_prompt, user_message)
    elif settings.openai_api_key:
        return await _call_openai(system_prompt, user_message)
    else:
        return _mock_response(point_label)


async def _call_openai(system_prompt: str, user_message: str) -> dict:
    from openai import AsyncOpenAI
    import json

    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    return json.loads(response.choices[0].message.content)


async def _call_anthropic(system_prompt: str, user_message: str) -> dict:
    import anthropic
    import json

    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    text = message.content[0].text
    # Extract JSON block if wrapped in markdown
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    return json.loads(text)


def _mock_response(point_label: str) -> dict:
    return {
        "suggestion": f"Inspect the {point_label} carefully and fill all required fields.",
        "field_hints": {},
        "warnings": [],
        "recommended_next_points": [],
    }
