# Quickstart: Backend API Development

**Branch**: `002-backend-api-spec` | **Date**: 2026-02-06

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Access to a Neon PostgreSQL database (or local PostgreSQL for dev)
- The frontend running (for end-to-end testing)

## Environment Setup

### 1. Create backend project directory

The backend lives at the repository root under `backend/`.

### 2. Set up Python virtual environment

Create and activate a virtual environment in the `backend/` directory.

### 3. Install dependencies

Required packages:

| Package       | Purpose                                |
|---------------|----------------------------------------|
| fastapi       | Web framework                          |
| uvicorn       | ASGI server                            |
| sqlmodel      | ORM (SQLModel + SQLAlchemy + Pydantic) |
| pyjwt         | JWT verification (HS256)               |
| asyncpg       | Async PostgreSQL driver                |
| python-dotenv | Environment variable loading           |
| httpx         | HTTP client (testing)                  |
| pytest        | Test framework                         |
| pytest-asyncio| Async test support                     |

### 4. Configure environment variables

Create `backend/.env` with:

| Variable            | Example Value                            | Required |
|---------------------|------------------------------------------|----------|
| BETTER_AUTH_SECRET  | (must match frontend's value)            | Yes      |
| NEON_DB_URL         | postgresql+asyncpg://user:pass@host/db   | Yes      |
| BETTER_AUTH_URL     | http://localhost:3000                     | No       |
| CORS_ORIGINS        | http://localhost:3000                     | Yes      |

**CRITICAL**: `BETTER_AUTH_SECRET` must be identical to the value in
the frontend's `.env` file. Mismatched secrets will cause all JWT
verification to fail.

### 5. Verify setup

The application should:
- Start without errors
- Connect to the database
- Create the `tasks` table if it doesn't exist
- Fail to start if required environment variables are missing

## Development Workflow

### Running the backend

Start the FastAPI development server on port 8000.

### Running tests

Run the test suite. Tests should use a separate test database or
in-memory SQLite for isolation.

### Testing with the frontend

1. Start the frontend (port 3000)
2. Start the backend (port 8000)
3. Sign in on the frontend
4. Create/edit/delete tasks — all operations go through the backend

## API Base URL

- Development: `http://localhost:8000`
- All task endpoints: `http://localhost:8000/api/tasks`
- Health check (optional): `http://localhost:8000/health`

## Key Files (Expected Structure)

```
backend/
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Template for environment variables
├── requirements.txt        # Python dependencies
├── app/
│   ├── main.py             # FastAPI application entry point
│   ├── config.py           # Environment variable loading
│   ├── database.py         # Database engine and session
│   ├── models.py           # SQLModel database models
│   ├── schemas.py          # Pydantic request/response models
│   ├── auth.py             # JWT verification middleware
│   ├── routes/
│   │   └── tasks.py        # Task CRUD endpoints
│   └── exceptions.py       # Custom error handlers
└── tests/
    ├── conftest.py          # Test fixtures (DB, client, tokens)
    ├── test_auth.py         # JWT verification tests
    ├── test_tasks.py        # Task CRUD endpoint tests
    └── test_validation.py   # Input validation tests
```

## Verification Checklist

Before starting implementation, verify:

- [ ] Python 3.11+ is installed
- [ ] Virtual environment is created
- [ ] All packages install successfully
- [ ] `BETTER_AUTH_SECRET` matches the frontend value
- [ ] Database URL is correct and accessible
- [ ] Backend starts on port 8000
- [ ] Frontend can reach `http://localhost:8000`
