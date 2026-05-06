from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["인증"])

REDIRECT_URI = "http://localhost:5173"

class KakaoCode(BaseModel):
    code: str

@router.post("/kakao")
async def kakao_login(body: KakaoCode):
    # 1. 인가코드 → 액세스토큰
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://kauth.kakao.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.KAKAO_CLIENT_ID,
                "redirect_uri": REDIRECT_URI,
                "code": body.code,
            }
        )
    
    token_data = token_res.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        raise HTTPException(status_code=400, detail="토큰 발급 실패")
    
    # 2. 액세스토큰 → 유저 정보
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    user_data = user_res.json()
    kakao_account = user_data.get("kakao_account", {})
    profile = kakao_account.get("profile", {})
    
    return {
        "id": user_data.get("id"),
        "name": profile.get("nickname"),
        "email": kakao_account.get("email"),
        "picture": profile.get("profile_image_url"),
    }