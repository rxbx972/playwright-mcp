# QA-MCP-Automation

Agent Studio Stage 사용자 관리 E2E 자동화 (Playwright + CSV 시나리오)

> **현황 (2025-09~)**: Agent Studio UI·정책 전면 변경으로 `users_03_02` 이후 구현 중단.  
> **마지막 실행 (2025-08-04)**: 9개 통과 / 21.9초 (`users_02_03` 제외)

## Quick Start

```bash
cp .env.example .env          # BASE_URL, 계정 정보 입력
npm install
npx playwright install
npx playwright test tests/agent-studio-users-test.spec.js
```

`TEST_USER_B_ID`는 테스트 `beforeAll`에서 `scripts/generate_unique_id.py`가 자동 갱신합니다.

## 시나리오 커버리지

상세 Step·Expected Result는 [`test-data/users-test-scenarios.csv`](test-data/users-test-scenarios.csv)가 정본입니다.

| ID | 영역 | 요약 | 상태 |
|----|------|------|------|
| `users_01_01` | 로그인 | 유효 계정 로그인 | 구현 완료 |
| `users_01_02` | 네비게이션 | 설정 → 사용자 관리 (`/users`) | 구현 완료 |
| `users_02_01` | 유효성 | 빈 필드 — 오류 4종 | 구현 완료 |
| `users_02_02` ~ `04` | 이름 검증 | 1자 / 숫자 / 특수문자 | 구현 완료 |
| `users_02_05` ~ `07` | 아이디 검증 | 3자 미만 / 대문자 / 특수문자 | 구현 완료 |
| `users_03_01` | 등록 | 유효 데이터 등록·목록 확인 | 구현 완료 |
| `users_03_02` | 상세 | 등록 사용자 정보 확인 | CSV만 작성 |
| `users_04_01` | 상태 | 활성 → 비활성 | CSV만 작성 |
| `users_05_01` | 상태 | 비활성 → 삭제 | CSV만 작성 |
| `users_lifecycle` | 통합 | `users_03_01` → `05_01` 순차 실행 | 부분 구현 |

## 프로젝트 구조

```
QA-MCP-Automation/
├── tests/
│   ├── agent-studio-users-test.spec.js
│   └── helpers/normalize-test-results.js
├── test-data/
│   ├── users-test-scenarios.csv      # 시나리오 정본
│   ├── test-data.json                # 검증 메시지·테스트 입력값
│   └── load-test-data.js
├── scripts/
│   ├── generate_unique_id.py         # TEST_USER_B_ID 자동 갱신
│   └── load_test_data.py             # .env 갱신 유틸
├── docs/
│   ├── architecture.md
│   └── CONTRIBUTING.md
├── playwright.config.js
└── .env.example
```

데이터 흐름·스크립트 역할·설계 결정 → [docs/architecture.md](docs/architecture.md)

## 환경 설정

민감 정보는 `.env`, UI 메시지·입력값은 `test-data/test-data.json`에서 관리합니다.

```bash
cp .env.example .env
```

필수 변수: `BASE_URL`, `TEST_USER_A_ID`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_PASSWORD`, `TEST_USER_B_NAME`, `TEST_USER_B_INITIAL_PASSWORD`

선택 변수: `TEST_USER_B_ID` (미설정 시 실행 시 자동 생성)

## 실행 & 디버깅

```bash
# 전체 / 단일 시나리오
npx playwright test tests/agent-studio-users-test.spec.js
npx playwright test --grep "users_02_01"

# 브라우저 표시 + 상세 로그
npx playwright test --headed --reporter=list

# 특정 시나리오 제외
npx playwright test tests/agent-studio-users-test.spec.js --grep-invert "users_lifecycle"

# HTML 리포트
npx playwright show-report
```

실패 시 `test-results/users-XX-YY-chromium/`에서 `video.webm`, `failed.png`, `error-context.md`를 확인합니다.

## 테스트 결과

**마지막 성공 실행: 2025-08-04**

| 항목 | 값 |
|------|-----|
| 통과 | 9 / 9 |
| 실행 시간 | 21.9초 |
| 제외 | `users_02_03` (이름 숫자 포함) |

아티팩트: 전 테스트 `video` 녹화, 실패 시 `screenshot` · `error-context.md`  
설정 상세: [docs/architecture.md#테스트-아티팩트](docs/architecture.md#테스트-아티팩트)

## 기여

시나리오 추가·코드 수정 가이드 → [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

**마지막 업데이트**: 2026년 6월 26일
