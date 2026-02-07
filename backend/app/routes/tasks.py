import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.exceptions import TaskNotFoundError
from app.models import Task
from app.schemas import TaskCreateRequest, TaskResponse, TaskUpdateRequest

router = APIRouter(prefix="/api/tasks", dependencies=[Depends(get_current_user)])


@router.post("", status_code=201, response_model=TaskResponse)
async def create_task(
    body: TaskCreateRequest,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    now = datetime.now(timezone.utc)
    task = Task(
        id=uuid.uuid4(),
        user_id=user_id,
        title=body.title,
        description=body.description,
        completed=False,
        created_at=now,
        updated_at=now,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskResponse.from_task(task)


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[TaskResponse]:
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()
    return [TaskResponse.from_task(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise TaskNotFoundError()
    return TaskResponse.from_task(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    body: TaskUpdateRequest,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise TaskNotFoundError()

    if body.title is not None:
        task.title = body.title
    if body.description_was_provided:
        task.description = body.description
    if body.status is not None:
        task.completed = body.status == "completed"

    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskResponse.from_task(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise TaskNotFoundError()
    session.delete(task)
    session.commit()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_complete(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise TaskNotFoundError()

    task.completed = not task.completed
    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskResponse.from_task(task)
