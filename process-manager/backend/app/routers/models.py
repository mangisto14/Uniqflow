from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..schemas.model_template import (
    ModelTemplateCreate,
    ModelTemplateUpdate,
    ModelTemplateOut,
    ModelCategory,
)

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[ModelTemplateOut])
async def list_models(category: ModelCategory | None = None, db=Depends(get_db)):
    query = db.table("model_templates").select("*")
    if category:
        query = query.eq("model_category", category.value)
    res = query.order("created_at", desc=True).execute()
    return res.data


@router.get("/{model_id}", response_model=ModelTemplateOut)
async def get_model(model_id: str, db=Depends(get_db)):
    res = db.table("model_templates").select("*").eq("id", model_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Model not found")
    return res.data


@router.post("", response_model=ModelTemplateOut, status_code=201)
async def create_model(body: ModelTemplateCreate, db=Depends(get_db)):
    payload = body.model_dump()
    # Serialize nested objects to plain dicts
    payload["points"] = [p.model_dump() if hasattr(p, "model_dump") else p for p in (payload.get("points") or [])]
    res = db.table("model_templates").insert(payload).execute()
    return res.data[0]


@router.put("/{model_id}", response_model=ModelTemplateOut)
async def update_model(model_id: str, body: ModelTemplateUpdate, db=Depends(get_db)):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    if "points" in payload:
        payload["points"] = [
            p.model_dump() if hasattr(p, "model_dump") else p for p in payload["points"]
        ]
    res = db.table("model_templates").update(payload).eq("id", model_id).execute()
    if not res.data:
        raise HTTPException(404, "Model not found")
    return res.data[0]


@router.delete("/{model_id}", status_code=204)
async def delete_model(model_id: str, db=Depends(get_db)):
    db.table("model_templates").delete().eq("id", model_id).execute()
