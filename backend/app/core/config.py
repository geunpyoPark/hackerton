from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    KAKAO_REST_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # ✅ 이거 추가! 모르는 필드 무시

settings = Settings()