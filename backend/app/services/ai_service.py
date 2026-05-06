import json
import re

import httpx

from app.core.config import settings


USER_TYPE_LABELS = {
    "wheelchair": "휠체어",
    "stroller": "유모차",
    "elderly": "노약자",
    "crutch": "목발 사용자",
}


def build_rule_based_summary(place: dict, reports: list[dict], user_type: str) -> dict:
    label = USER_TYPE_LABELS.get(user_type, "휠체어")
    issue_types = {report.get("issue_type") for report in reports}
    has_elevator_problem = not place.get("has_elevator") or "elevator_broken" in issue_types
    has_step_problem = (
        place.get("has_stairs")
        or place.get("has_curb")
        or "stairs" in issue_types
        or "curb" in issue_types
        or "blocked" in issue_types
    )
    has_slope_problem = (
        place.get("slope_level") not in (None, "low")
        or "steep_slope" in issue_types
        or "slope" in issue_types
    )

    if user_type == "wheelchair" and (has_elevator_problem or has_step_problem):
        return {
            "oneLine": f"{label} 이용자는 {place.get('name', '해당 장소')} 이용이 어렵습니다.",
            "risks": "엘리베이터 이용 제한과 계단/턱 위험이 확인됩니다.",
            "action": "엘리베이터가 있는 대체 출구를 이용하세요.",
            "accessible": False,
            "source": "rule",
        }

    if user_type in ("stroller", "elderly") and has_step_problem:
        return {
            "oneLine": f"{label} 기준으로 주의가 필요한 경로입니다.",
            "risks": "계단 또는 턱이 있어 이동 속도가 느려질 수 있습니다.",
            "action": "가능하면 엘리베이터가 있는 출구를 선택하고 보호자 동행을 권장합니다.",
            "accessible": False,
            "source": "rule",
        }

    if has_slope_problem:
        return {
            "oneLine": f"{label} 기준으로 이동은 가능하지만 경사 구간 주의가 필요합니다.",
            "risks": "경사 구간 관련 제보가 있습니다.",
            "action": "천천히 이동하고 우천 시 대체 경로를 확인하세요.",
            "accessible": True,
            "source": "rule",
        }

    return {
        "oneLine": f"{label} 기준으로 이동 가능한 경로입니다.",
        "risks": "큰 위험 요소가 확인되지 않았습니다.",
        "action": "현재 추천 경로를 이용해도 됩니다.",
        "accessible": True,
        "source": "rule",
    }


def build_prompt(place: dict, reports: list[dict], user_type: str) -> str:
    label = USER_TYPE_LABELS.get(user_type, user_type)
    recent_reports = [
        {
            "issue_type": report.get("issue_type"),
            "description": report.get("description"),
            "created_at": report.get("created_at"),
        }
        for report in reports[:5]
    ]

    return f"""
다음 장소 접근성 정보와 사용자 제보를 바탕으로, {label} 사용자가 실제로 이동 가능한지 판단해줘.
결과는 한국어로 짧게 작성하고 반드시 JSON만 반환해.

JSON 형식:
{{
  "oneLine": "한 줄 요약",
  "risks": "위험 요소",
  "action": "추천 행동",
  "accessible": true 또는 false
}}

장소:
{json.dumps(place, ensure_ascii=False)}

최근 제보:
{json.dumps(recent_reports, ensure_ascii=False)}
""".strip()


def parse_gemini_json(text: str) -> dict:
    cleaned = text.strip()
    cleaned = re.sub(r"^```json\s*|\s*```$", "", cleaned, flags=re.IGNORECASE | re.MULTILINE)
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not match:
        raise ValueError("Gemini response did not contain JSON")
    return json.loads(match.group(0))


async def summarize_accessibility(place: dict, reports: list[dict], user_type: str) -> dict:
    fallback = build_rule_based_summary(place, reports, user_type)
    if not settings.GEMINI_API_KEY:
        return fallback

    prompt = build_prompt(place, reports, user_type)
    models = [settings.GEMINI_MODEL, "gemini-2.0-flash", "gemini-2.5-flash"]

    async with httpx.AsyncClient(timeout=12) as client:
        for model in dict.fromkeys(models):
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={settings.GEMINI_API_KEY}"
            )

            try:
                response = await client.post(
                    url,
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 300,
                            "responseMimeType": "application/json",
                        },
                    },
                )
                if response.status_code >= 500:
                    continue
                response.raise_for_status()
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                summary = parse_gemini_json(text)
                return {
                    "oneLine": summary.get("oneLine") or fallback["oneLine"],
                    "risks": summary.get("risks") or fallback["risks"],
                    "action": summary.get("action") or fallback["action"],
                    "accessible": bool(summary.get("accessible", fallback["accessible"])),
                    "source": "gemini",
                    "model": model,
                }
            except Exception:
                continue

    return {**fallback, "source": "fallback", "error": "AI 요약 API 호출에 실패했습니다."}
