from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any
from ..database import get_db
from ..services.ai_service import get_ai_suggestion

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    process_id: str
    point_id: str
    point_label: str
    fields: list[dict[str, Any]] = []
    field_values: dict[str, Any] = {}
    process_context: dict[str, Any] = {}


class ChatResponse(BaseModel):
    suggestion: str
    field_hints: dict[str, str] = {}
    warnings: list[str] = []
    recommended_next_points: list[str] = []


@router.post("", response_model=ChatResponse)
async def chat_for_point(body: ChatRequest, db=Depends(get_db)):
    try:
        result = await get_ai_suggestion(
            point_id=body.point_id,
            point_label=body.point_label,
            fields=body.fields,
            field_values=body.field_values,
            process_context=body.process_context,
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(500, f"AI service error: {e}")
