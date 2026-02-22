import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class TaskCreateRequest(BaseModel):
    model_config = {"extra": "ignore"}

    title: str
    description: str | None = None

    @field_validator("title", mode="before")
    @classmethod
    def trim_title(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("Title is required")
        if len(v) > 200:
            raise ValueError("Title must be 200 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 2000:
            raise ValueError("Description must be 2000 characters or fewer")
        return v


class TaskUpdateRequest(BaseModel):
    model_config = {"extra": "ignore"}

    title: str | None = None
    description: str | None = Field(default=None)
    status: Literal["pending", "completed"] | None = None

    # Track whether description was actually provided in the payload
    description_was_provided: bool = Field(default=False, exclude=True)

    @model_validator(mode="before")
    @classmethod
    def check_at_least_one_field(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Track if description key was in the raw payload
            has_description = "description" in data
            fields = {"title", "description", "status"}
            has_any_non_null = any(k in data and data[k] is not None for k in fields)

            if not has_any_non_null and not has_description:
                raise ValueError("At least one field must be provided")

            # Pass the tracking flag through the data
            data["description_was_provided"] = has_description
        return data

    @field_validator("title", mode="before")
    @classmethod
    def trim_title(cls, v: str | None) -> str | None:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("title")
    @classmethod
    def title_validation(cls, v: str | None) -> str | None:
        if v is not None:
            if not v:
                raise ValueError("Title is required")
            if len(v) > 200:
                raise ValueError("Title must be 200 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 2000:
            raise ValueError("Description must be 2000 characters or fewer")
        return v


class TaskResponse(BaseModel):
    model_config = {"populate_by_name": True}

    id: uuid.UUID
    title: str
    description: str | None
    status: str
    created_at: datetime = Field(alias="createdAt", serialization_alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt", serialization_alias="updatedAt")

    @classmethod
    def from_task(cls, task: Any) -> "TaskResponse":
        return cls(
            id=task.id,
            title=task.title,
            description=task.description,
            status="completed" if task.completed else "pending",
            createdAt=task.created_at,
            updatedAt=task.updated_at,
        )
