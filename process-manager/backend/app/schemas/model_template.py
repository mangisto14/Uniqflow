from pydantic import BaseModel
from typing import Any, Optional
from enum import Enum


class ModelType(str, Enum):
    SVG = "svg"
    THREE_D = "3d"


class ModelCategory(str, Enum):
    VEHICLE = "vehicle"
    EQUIPMENT = "equipment"
    HUMAN = "human"


class PointField(BaseModel):
    name: str
    label: str
    field_type: str  # text | number | select | date | textarea | checkbox
    required: bool = False
    options: Optional[list[str]] = None
    placeholder: Optional[str] = None


class ModelPoint(BaseModel):
    point_id: str
    label: str
    coordinates: dict[str, float]  # {x, y, z}
    fields: list[PointField] = []
    next_points: list[str] = []
    description: Optional[str] = None


class ModelTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: ModelType = ModelType.SVG
    model_category: ModelCategory = ModelCategory.VEHICLE
    model_file: Optional[str] = None
    points: list[ModelPoint] = []


class ModelTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model_type: Optional[ModelType] = None
    model_category: Optional[ModelCategory] = None
    model_file: Optional[str] = None
    points: Optional[list[ModelPoint]] = None


class ModelTemplateOut(ModelTemplateCreate):
    id: str
    created_at: str
    updated_at: Optional[str] = None
