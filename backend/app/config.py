import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    BETTER_AUTH_SECRET: str
    NEON_DB_URL: str
    CORS_ORIGINS: list[str]
    BETTER_AUTH_URL: str | None

    def __init__(self) -> None:
        self.BETTER_AUTH_SECRET = os.environ.get("BETTER_AUTH_SECRET", "")
        if not self.BETTER_AUTH_SECRET:
            raise RuntimeError("BETTER_AUTH_SECRET environment variable is required")

        self.NEON_DB_URL = os.environ.get("NEON_DB_URL", "")
        if not self.NEON_DB_URL:
            raise RuntimeError("NEON_DB_URL environment variable is required")

        cors_raw = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
        self.CORS_ORIGINS = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]

        self.BETTER_AUTH_URL = os.environ.get("BETTER_AUTH_URL")


settings = Settings()
