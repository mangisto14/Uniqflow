from pydantic import BaseModel
from typing import Optional


class TeamCreate(BaseModel):
    name: str
    color: str = "#3b82f6"
    description: Optional[str] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None


class TeamOut(TeamCreate):
    id: str
    created_at: str
