# playwright-test-e2e

[nl-scenario-pipeline](../README.md)의 **Playwright Test** 실행 경로 — CSV 자연어 시나리오 회귀 + **Playwright MCP**(Cursor 탐색·작성)

> **현황 (2025-09~)**: 샘플 앱 UI·정책 변경으로 `users_03_02` 이후 구현 중단.  
> **마지막 실행 (2025-08-04)**: 9개 통과 / 21.9초 (`users_02_03` 제외)

## Quick Start

```bash
cp .env.example .env
npm install
npx playwright install
npx playwright test tests/agent-studio-users-test.spec.js
```

**시나리오 탐색·작성 (Cursor)**

1. [nl-scenario-pipeline](../README.md) 루트 또는 이 폴더를 Cursor로 연다
2. [`.cursor/mcp.json`](../.cursor/mcp.json) Playwright MCP 활성화 확인
3. [docs/mcp-workflow.md](docs/mcp-workflow.md)

## 시나리오 커버리지

시나리오 파일: [`test-data/users-test-scenarios.csv`](test-data/users-test-scenarios.csv) — 자연어 Step·Expected Result가 담긴 CSV

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
playwright-test-e2e/
├── tests/
│   ├── agent-studio-users-test.spec.js
│   └── helpers/normalize-test-results.js
├── test-data/
│   ├── users-test-scenarios.csv
│   ├── test-data.json
│   └── load-test-data.js
├── scripts/
├── docs/
├── playwright.config.js
└── .env.example
```

| 용도 | 도구 |
|------|------|
| UI 탐색, 셀렉터·시나리오 작성 | Playwright MCP (Cursor) |
| 자동화 실행, 리포트·영상 | Playwright Test |

[docs/architecture.md](docs/architecture.md) · [docs/mcp-workflow.md](docs/mcp-workflow.md) · [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 환경 설정

민감 정보는 `.env`, UI 메시지·입력값은 `test-data/test-data.json`에서 관리합니다.

필수 변수: `BASE_URL`, `TEST_USER_A_ID`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_PASSWORD`, `TEST_USER_B_NAME`, `TEST_USER_B_INITIAL_PASSWORD`

`TEST_USER_B_ID`는 테스트 `beforeAll`에서 `scripts/generate_unique_id.py`가 자동 갱신합니다.

## 실행 & 디버깅

```bash
npx playwright test tests/agent-studio-users-test.spec.js
npx playwright test --grep "users_02_01"
npx playwright test --headed --reporter=list
npx playwright test tests/agent-studio-users-test.spec.js --grep-invert "users_lifecycle"
npx playwright show-report
```

실패 시 `test-results/users-XX-YY-chromium/`에서 `video.webm`, `failed.png`, `error-context.md`를 확인합니다.

## 테스트 결과 (2025-08-04)

| 항목 | 값 |
|------|-----|
| 통과 | 9 / 9 |
| 실행 시간 | 21.9초 |
| 제외 | `users_02_03` |

---

**마지막 업데이트**: 2026년 6월 26일
