from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    KAKAO_REST_API_KEY: str = ""
    KAKAO_CLIENT_ID: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    kakao_client_secret: str = ""
    KAKAO_REDIRECT_URI: str = "http://localhost:5173"

    @property
    def kakao_client_id(self) -> str:
        return self.KAKAO_REST_API_KEY or self.KAKAO_CLIENT_ID
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
