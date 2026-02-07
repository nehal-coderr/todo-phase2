from collections.abc import Generator

from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel

from app.config import settings

# Convert connection string for SQLAlchemy sync driver
_db_url = settings.NEON_DB_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(_db_url, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
