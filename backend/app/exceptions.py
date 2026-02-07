from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class TaskNotFoundError(Exception):
    """Raised when a task is not found or not owned by the user."""
    pass


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Convert Pydantic validation errors to human-readable messages."""
    errors = exc.errors()
    if errors:
        first = errors[0]
        # Extract the actual error message from the context or msg
        ctx = first.get("ctx", {})
        error_obj = ctx.get("error")

        if error_obj is not None:
            # Custom validators raise ValueError with specific messages
            msg = str(error_obj)
            return JSONResponse(status_code=400, content={"error": msg})

        # Handle Pydantic built-in type errors
        loc = first.get("loc", ())
        field = loc[-1] if loc else None
        error_type = first.get("type", "")

        if field == "title" and error_type == "missing":
            return JSONResponse(
                status_code=400, content={"error": "Title is required"}
            )
        if field == "status" and error_type == "literal_error":
            return JSONResponse(
                status_code=400,
                content={"error": "Status must be 'pending' or 'completed'"},
            )

    return JSONResponse(status_code=400, content={"error": "Validation error"})


async def task_not_found_handler(
    request: Request, exc: TaskNotFoundError
) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={"error": "Task not found"},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
