from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    KAKAO_REST_API_KEY: str = ""
    KAKAO_CLIENT_ID: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # ✅ 이거 추가! 모르는 필드 무시

settings = Settings()
