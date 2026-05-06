from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import summarize_accessibility

router = APIRouter(prefix="/ai", tags=["AI"])


class AccessibilitySummaryRequest(BaseModel):
    user_type: str
    place: dict
    reports: list[dict] = []


@router.post("/accessibility-summary")
async def accessibility_summary(body: AccessibilitySummaryRequest):
    return await summarize_accessibility(
        place=body.place,
        reports=body.reports,
        user_type=body.user_type,
    )
