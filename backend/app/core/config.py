from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SIGECON"
    ENVIRONMENT: str = "production"

    # Database
    POSTGRES_URL: str
    POSTGRES_URL_NON_POOLING: str | None = None
    SQL_ECHO: bool = False

    @property
    def database_url(self) -> str:
        return self.POSTGRES_URL.replace("postgres://", "postgresql://", 1)

    @property
    def migration_database_url(self) -> str:
        url = self.POSTGRES_URL_NON_POOLING or self.POSTGRES_URL
        return url.replace("postgres://", "postgresql://", 1)

    # Security
    SECRET_KEY: str
    SECRET_KEYS: list[str] = []
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "https://sigecon-front.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5175",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5175",
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
