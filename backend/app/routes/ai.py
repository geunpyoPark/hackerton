from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import classify_report, summarize_accessibility

router = APIRouter(prefix="/ai", tags=["AI"])


class AccessibilitySummaryRequest(BaseModel):
    user_type: str
    place: dict
    reports: list[dict] = []


class ReportClassificationRequest(BaseModel):
    user_type: str
    place: dict
    report: dict


@router.post("/accessibility-summary")
async def accessibility_summary(body: AccessibilitySummaryRequest):
    return await summarize_accessibility(
        place=body.place,
        reports=body.reports,
        user_type=body.user_type,
    )


@router.post("/classify-report")
async def report_classification(body: ReportClassificationRequest):
    return await classify_report(
        report=body.report,
        place=body.place,
        user_type=body.user_type,
    )
