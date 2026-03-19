from pydantic import BaseModel
from typing import Any, Optional
from enum import Enum


class ProcessStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProcessTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model_template_id: Optional[str] = None
    template_points: list[dict[str, Any]] = []


class ProcessTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model_template_id: Optional[str] = None
    template_points: Optional[list[dict[str, Any]]] = None


class ProcessTemplateOut(ProcessTemplateCreate):
    id: str
    created_at: str


class ProcessInstanceCreate(BaseModel):
    template_id: str
    team_id: Optional[str] = None
    name: Optional[str] = None


class ProcessInstanceUpdate(BaseModel):
    status: Optional[ProcessStatus] = None
    selected_points: Optional[list[str]] = None
    field_values: Optional[dict[str, Any]] = None


class ProcessInstanceOut(BaseModel):
    id: str
    template_id: str
    team_id: Optional[str]
    name: Optional[str]
    status: ProcessStatus
    selected_points: list[str]
    field_values: dict[str, Any]
    created_at: str
    updated_at: Optional[str]


class PointFieldValuesIn(BaseModel):
    field_values: dict[str, Any]


class PointFieldValuesOut(BaseModel):
    point_id: str
    fields: list[dict[str, Any]]
    saved_values: dict[str, Any]
    next_points: list[str]
