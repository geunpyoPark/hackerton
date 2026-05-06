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

REPORT_CATEGORY_LABELS = {
    "elevator_broken": "엘리베이터 고장",
    "stairs": "계단/턱",
    "curb": "계단/턱",
    "steep_slope": "급경사",
    "slope": "급경사",
    "construction": "공사 중",
    "blocked": "통행 불가",
}


def get_report_category(issue_type: str) -> str:
    return REPORT_CATEGORY_LABELS.get(issue_type, "기타")


def get_report_severity(issue_type: str) -> str:
    if issue_type in {"elevator_broken", "stairs", "curb", "blocked"}:
        return "high"
    if issue_type in {"steep_slope", "slope", "construction"}:
        return "medium"
    return "low"


def get_responsible_agency(issue_type: str, place: dict) -> str:
    station_name = place.get("station_name") or ""
    place_text = f"{place.get('name', '')} {station_name}"
    if issue_type in {"elevator_broken", "stairs", "blocked"} and station_name:
        return "서울교통공사"
    if issue_type in {"curb", "steep_slope", "slope", "construction"}:
        return "도로관리사업소"
    if "강남" in place_text or "삼성" in place_text or "코엑스" in place_text:
        return "강남구청"
    if "송파" in place_text or "잠실" in place_text:
        return "송파구청"
    if "서초" in place_text or "교대" in place_text:
        return "서초구청"
    return "기타 기관"


def get_priority_score(issue_type: str, severity: str, has_image: bool) -> int:
    base = {"high": 75, "medium": 50, "low": 30}.get(severity, 30)
    if issue_type == "blocked":
        base += 10
    if has_image:
        base += 5
    return min(100, base)


def build_rule_based_classification(report: dict, place: dict, user_type: str) -> dict:
    issue_type = report.get("issue_type", "")
    category = get_report_category(issue_type)
    severity = get_report_severity(issue_type)
    agency = get_responsible_agency(issue_type, place)
    place_name = place.get("name") or "선택 장소"
    description = report.get("description") or category
    has_image = bool(report.get("image_url"))

    return {
        "ai_category": category,
        "ai_severity": severity,
        "ai_summary": f"{place_name}에서 {category} 민원이 접수되었습니다. 내용: {description}",
        "responsible_agency": agency,
        "priority_score": get_priority_score(issue_type, severity, has_image),
        "source": "rule",
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


def build_classification_prompt(report: dict, place: dict, user_type: str) -> str:
    label = USER_TYPE_LABELS.get(user_type, user_type)
    return f"""
다음 교통약자 접근성 제보를 기관용 민원 데이터로 분류해줘.
반드시 JSON만 반환해.

JSON 형식:
{{
  "ai_category": "엘리베이터 고장 | 계단/턱 | 급경사 | 공사 중 | 통행 불가 | 기타 중 하나",
  "ai_severity": "high | medium | low 중 하나",
  "ai_summary": "기관 담당자가 한눈에 볼 수 있는 한 줄 요약",
  "responsible_agency": "서울교통공사 | 도로관리사업소 | 구청명 | 기타 기관 중 하나",
  "priority_score": 0부터 100 사이 정수
}}

사용자 유형: {label}
장소:
{json.dumps(place, ensure_ascii=False)}

제보:
{json.dumps(report, ensure_ascii=False)}
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


async def classify_report(report: dict, place: dict, user_type: str) -> dict:
    fallback = build_rule_based_classification(report, place, user_type)
    if not settings.GEMINI_API_KEY:
        return fallback

    prompt = build_classification_prompt(report, place, user_type)
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
                            "temperature": 0.1,
                            "maxOutputTokens": 320,
                            "responseMimeType": "application/json",
                        },
                    },
                )
                if response.status_code >= 500:
                    continue
                response.raise_for_status()
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                classification = parse_gemini_json(text)
                severity = classification.get("ai_severity") or fallback["ai_severity"]
                priority_score = classification.get("priority_score", fallback["priority_score"])
                try:
                    priority_score = int(priority_score)
                except (TypeError, ValueError):
                    priority_score = fallback["priority_score"]

                return {
                    "ai_category": classification.get("ai_category") or fallback["ai_category"],
                    "ai_severity": severity if severity in {"high", "medium", "low"} else fallback["ai_severity"],
                    "ai_summary": classification.get("ai_summary") or fallback["ai_summary"],
                    "responsible_agency": classification.get("responsible_agency") or fallback["responsible_agency"],
                    "priority_score": max(0, min(100, priority_score)),
                    "source": "gemini",
                    "model": model,
                }
            except Exception:
                continue

    return {**fallback, "source": "fallback", "error": "AI 민원 분류 API 호출에 실패했습니다."}
