from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..schemas.team import TeamCreate, TeamUpdate, TeamOut

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamOut])
async def list_teams(db=Depends(get_db)):
    res = db.table("teams").select("*").order("created_at").execute()
    return res.data


@router.get("/{team_id}", response_model=TeamOut)
async def get_team(team_id: str, db=Depends(get_db)):
    res = db.table("teams").select("*").eq("id", team_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Team not found")
    return res.data


@router.post("", response_model=TeamOut, status_code=201)
async def create_team(body: TeamCreate, db=Depends(get_db)):
    res = db.table("teams").insert(body.model_dump()).execute()
    return res.data[0]


@router.put("/{team_id}", response_model=TeamOut)
async def update_team(team_id: str, body: TeamUpdate, db=Depends(get_db)):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    res = db.table("teams").update(payload).eq("id", team_id).execute()
    if not res.data:
        raise HTTPException(404, "Team not found")
    return res.data[0]


@router.delete("/{team_id}", status_code=204)
async def delete_team(team_id: str, db=Depends(get_db)):
    db.table("teams").delete().eq("id", team_id).execute()
