import uuid
from collections.abc import Generator
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import jwt
import pytest
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel
from starlette.testclient import TestClient

from app.config import settings

# Use synchronous SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Test user IDs
USER_A_ID = str(uuid.uuid4())
USER_B_ID = str(uuid.uuid4())
SECRET = settings.BETTER_AUTH_SECRET

# Import model to register with SQLModel.metadata
from app.models import Task  # noqa: E402, F401
from app.database import get_session  # noqa: E402
from app.main import app  # noqa: E402


def make_token(
    user_id: str,
    expired: bool = False,
    no_sub: bool = False,
    no_exp: bool = False,
) -> str:
    """Generate a JWT token for testing."""
    payload: dict = {}
    if not no_sub:
        payload["sub"] = user_id
    if not no_exp:
        if expired:
            payload["exp"] = datetime.now(timezone.utc) - timedelta(hours=1)
        else:
            payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
    payload["iat"] = datetime.now(timezone.utc)
    return jwt.encode(payload, SECRET, algorithm="HS256")


# Override get_session to use test SQLite engine
def override_get_session() -> Generator[Session, None, None]:
    with Session(test_engine) as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test, drop after."""
    SQLModel.metadata.create_all(test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture
def client(setup_database) -> Generator[TestClient, None, None]:
    # Patch create_db_and_tables to prevent lifespan from using production DB
    with patch("app.main.create_db_and_tables"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


@pytest.fixture
def user_a_token() -> str:
    return make_token(USER_A_ID)


@pytest.fixture
def user_b_token() -> str:
    return make_token(USER_B_ID)


@pytest.fixture
def user_a_headers(user_a_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {user_a_token}"}


@pytest.fixture
def user_b_headers(user_b_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {user_b_token}"}
