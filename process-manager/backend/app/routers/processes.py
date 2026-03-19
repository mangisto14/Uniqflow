from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..schemas.process import (
    ProcessTemplateCreate,
    ProcessTemplateUpdate,
    ProcessTemplateOut,
    ProcessInstanceCreate,
    ProcessInstanceUpdate,
    ProcessInstanceOut,
    PointFieldValuesIn,
    PointFieldValuesOut,
)

router = APIRouter(tags=["processes"])

# ── Process Templates ──────────────────────────────────────────────────────────

pt = APIRouter(prefix="/process-templates")


@pt.get("", response_model=list[ProcessTemplateOut])
async def list_templates(db=Depends(get_db)):
    res = db.table("process_templates").select("*").order("created_at", desc=True).execute()
    return res.data


@pt.get("/{template_id}", response_model=ProcessTemplateOut)
async def get_template(template_id: str, db=Depends(get_db)):
    res = db.table("process_templates").select("*").eq("id", template_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Template not found")
    return res.data


@pt.post("", response_model=ProcessTemplateOut, status_code=201)
async def create_template(body: ProcessTemplateCreate, db=Depends(get_db)):
    res = db.table("process_templates").insert(body.model_dump()).execute()
    return res.data[0]


@pt.put("/{template_id}", response_model=ProcessTemplateOut)
async def update_template(template_id: str, body: ProcessTemplateUpdate, db=Depends(get_db)):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    res = db.table("process_templates").update(payload).eq("id", template_id).execute()
    if not res.data:
        raise HTTPException(404, "Template not found")
    return res.data[0]


@pt.delete("/{template_id}", status_code=204)
async def delete_template(template_id: str, db=Depends(get_db)):
    db.table("process_templates").delete().eq("id", template_id).execute()


# ── Process Instances ──────────────────────────────────────────────────────────

pi = APIRouter(prefix="/processes")


@pi.get("", response_model=list[ProcessInstanceOut])
async def list_instances(team_id: str | None = None, db=Depends(get_db)):
    query = db.table("process_instances").select("*")
    if team_id:
        query = query.eq("team_id", team_id)
    res = query.order("created_at", desc=True).execute()
    return res.data


@pi.get("/{process_id}", response_model=ProcessInstanceOut)
async def get_instance(process_id: str, db=Depends(get_db)):
    res = db.table("process_instances").select("*").eq("id", process_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Process not found")
    return res.data


@pi.post("", response_model=ProcessInstanceOut, status_code=201)
async def create_instance(body: ProcessInstanceCreate, db=Depends(get_db)):
    payload = {
        **body.model_dump(),
        "status": "active",
        "selected_points": [],
        "field_values": {},
    }
    res = db.table("process_instances").insert(payload).execute()
    return res.data[0]


@pi.patch("/{process_id}", response_model=ProcessInstanceOut)
async def update_instance(process_id: str, body: ProcessInstanceUpdate, db=Depends(get_db)):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    res = db.table("process_instances").update(payload).eq("id", process_id).execute()
    if not res.data:
        raise HTTPException(404, "Process not found")
    return res.data[0]


@pi.delete("/{process_id}", status_code=204)
async def delete_instance(process_id: str, db=Depends(get_db)):
    db.table("process_instances").delete().eq("id", process_id).execute()


# ── Point Field Operations ─────────────────────────────────────────────────────

@pi.get("/{process_id}/points/{point_id}/fields", response_model=PointFieldValuesOut)
async def get_point_fields(process_id: str, point_id: str, db=Depends(get_db)):
    proc = db.table("process_instances").select("*, process_templates(*)").eq("id", process_id).single().execute()
    if not proc.data:
        raise HTTPException(404, "Process not found")

    instance = proc.data
    template = instance.get("process_templates") or {}

    # Find point definition in model template via template_points
    point_def = None
    for pt_point in (template.get("template_points") or []):
        if pt_point.get("point_id") == point_id:
            point_def = pt_point
            break

    # Also check model template if linked
    if not point_def and template.get("model_template_id"):
        mt = db.table("model_templates").select("points").eq("id", template["model_template_id"]).single().execute()
        if mt.data:
            for p in (mt.data.get("points") or []):
                if p.get("point_id") == point_id:
                    point_def = p
                    break

    if not point_def:
        raise HTTPException(404, "Point not found")

    saved = (instance.get("field_values") or {}).get(point_id, {})
    return PointFieldValuesOut(
        point_id=point_id,
        fields=point_def.get("fields", []),
        saved_values=saved,
        next_points=point_def.get("next_points", []),
    )


@pi.post("/{process_id}/points/{point_id}/fields", response_model=PointFieldValuesOut)
async def save_point_fields(
    process_id: str, point_id: str, body: PointFieldValuesIn, db=Depends(get_db)
):
    proc = db.table("process_instances").select("field_values, selected_points").eq("id", process_id).single().execute()
    if not proc.data:
        raise HTTPException(404, "Process not found")

    current = proc.data
    field_values = dict(current.get("field_values") or {})
    selected_points = list(current.get("selected_points") or [])

    field_values[point_id] = body.field_values
    if point_id not in selected_points:
        selected_points.append(point_id)

    db.table("process_instances").update(
        {"field_values": field_values, "selected_points": selected_points}
    ).eq("id", process_id).execute()

    # Re-fetch point def for next_points
    proc_full = db.table("process_instances").select("*, process_templates(*)").eq("id", process_id).single().execute()
    instance = proc_full.data
    template = instance.get("process_templates") or {}

    point_def = {}
    for p in (template.get("template_points") or []):
        if p.get("point_id") == point_id:
            point_def = p
            break

    return PointFieldValuesOut(
        point_id=point_id,
        fields=point_def.get("fields", []),
        saved_values=body.field_values,
        next_points=point_def.get("next_points", []),
    )


router.include_router(pt)
router.include_router(pi)
