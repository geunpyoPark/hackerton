# AbleRoute

> 교통약자의 이동 조건과 현장 제보를 바탕으로, 이동 경로와 접근성 정보를 제공하는 웹 서비스

**스마트정보통신공학과 해커톤 최우수상 · 2026-05**

## 프로젝트 소개

휠체어 사용자, 유모차 이용자, 노약자 등은 같은 경로라도 엘리베이터 고장, 계단·턱, 급경사와 같은 조건에 따라 이동 가능 여부가 달라집니다. AbleRoute는 사용자의 이동 유형을 기준으로 경로 주변의 접근성 정보와 제보를 확인하고, 위험 요소와 대체 행동을 안내하기 위해 만든 서비스입니다.

## 문제를 해결한 방식

| 문제 | 구현 방식 |
| --- | --- |
| 일반 경로만으로는 이동 가능 여부를 판단하기 어려움 | 사용자 유형, 장소 시설 정보, 최근 제보를 함께 분석해 접근성 요약 제공 |
| 현장의 변화가 경로 정보에 바로 반영되기 어려움 | 사진과 위치를 포함한 접근성 제보를 등록하고, 경로 주변 위험 제보를 지도에 표시 |
| 제보 내용을 담당 기관에 전달하기 어려움 | AI 및 규칙 기반 분류로 제보 유형·심각도·담당 기관·우선순위를 산출 |
| 출발지와 목적지의 실제 이동 경로 확인이 필요함 | 카카오 장소 검색, ODsay 대중교통 경로, T-map 보행 경로를 연결 |

## 핵심 기능

- 이동 유형별 접근성 요약 및 주의 사항 제공
- 출발지·목적지 기반 보행·대중교통 경로 탐색
- 지도 위 경로와 주변 위험 제보 표시
- 사진·위치·설명 기반 접근성 제보 등록
- Gemini와 규칙 기반 로직을 결합한 제보 분류 및 담당 기관 추천
- Kakao 로그인과 Supabase 기반 사용자·장소·제보 데이터 관리
- 관리자 대시보드를 통한 제보 현황 확인

## 나의 역할

**팀장 · Backend / AI / 서비스 연동**

- 프로젝트 기능 흐름을 정리하고 팀 작업을 조율했습니다.
- FastAPI 기반 AI 접근성 요약 및 제보 분류 API를 구현했습니다.
- 제보 내용에서 유형·심각도·담당 기관·우선순위를 판단하는 규칙 기반 보완 로직을 작성했습니다.
- Supabase 데이터 연결, Cloudinary 이미지 업로드, Kakao 로그인 프로필 연동을 연결했습니다.
- 경로 주변 위험 제보를 계산해 지도에서 확인할 수 있도록 개선했습니다.

## 시스템 구성

```text
React Web App
  ├── Kakao Map / Kakao Login
  ├── ODsay / T-map Route API
  ├── Supabase
  └── Cloudinary
          │
          ▼
Python FastAPI
  ├── Kakao OAuth API
  └── AI API
       ├── 접근성 요약
       └── 제보 분류 · 담당 기관 추천
          │
          ▼
        Gemini
```

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React, JavaScript, Vite |
| Backend | Python, FastAPI, Uvicorn, httpx |
| Data | Supabase |
| AI | Gemini |
| External API | Kakao Map, Kakao Login, ODsay, T-map |
| Image Storage | Cloudinary |
| Collaboration | Git, GitHub |

## 프로젝트 구조

```text
hackerton/
├── frontend/
│   └── src/
│       ├── screens/       # 로그인, 홈, 경로, 제보, 프로필 화면
│       ├── components/    # 지도 및 공통 UI
│       ├── lib/           # 외부 API·Supabase 연동
│       └── admin/         # 관리자 대시보드
└── backend/
    └── app/
        ├── routes/        # 인증·AI API
        ├── services/      # Gemini·규칙 기반 분류 로직
        └── core/          # 환경 설정
```

## 실행 방법

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

외부 서비스 키는 `frontend/.env.example`, `backend/.env.example`을 참고해 설정합니다.

## Team

스마트정보통신공학과 해커톤 팀 프로젝트로 진행했습니다.

## License

This project is for educational and portfolio purposes.
