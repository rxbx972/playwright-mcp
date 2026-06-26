# Architecture

## 개요

`users-test-scenarios.csv`의 Step을 **Playwright MCP 프로토콜**로 실행합니다. Playwright Test(`page`, `locator`)를 쓰지 않고 `browser_*` MCP 도구를 호출합니다.

```
users-test-scenarios.csv
        │
        ▼
  load-csv + placeholders
        │
        ▼
  ┌─────────────────────────────────┐
  │  Step 실행기 (per Step)         │
  │  ┌──────────┐  ┌─────────────┐  │
  │  │ llm.js   │  │ rules.js    │  │
  │  │ OpenAI   │  │ 패턴 매칭    │  │
  │  └────┬─────┘  └──────┬──────┘  │
  │       └───────┬───────┘         │
  │               ▼                 │
  │     PlaywrightMcpClient         │
  │     (stdio → @playwright/mcp)   │
  └─────────────────────────────────┘
        │
        ▼
  browser_navigate / browser_click / browser_snapshot / ...
```

## 실행 모드

기본값은 **`rules`** (`OPENAI_API_KEY` 불필요). Playwright MCP만으로 브라우저를 제어합니다.

### `rules` (기본)

`rules.js`가 Step 텍스트 패턴을 MCP 호출에 직접 매핑합니다 (`browser_navigate`, `browser_click` 등).

현재 지원: `users_01_01` 전체, `users_01_02` 일부. 미지원 Step은 `llm` 모드 안내.

### `llm` (선택)

1. CSV Step·Expected Result를 OpenAI에 전달
2. MCP 도구 목록을 function calling으로 노출
3. LLM이 `browser_*` 도구 선택 → 러너가 MCP `callTool` 실행
4. 스냅샷을 LLM에 다시 전달 (최대 15라운드)

**`OPENAI_API_KEY` 필요** — MCP 자체가 아니라 Step 해석용 LLM 때문입니다.

**특징**
- 새 Step을 CSV만으로 시도 가능 (러너 코드 분기 추가 없이)
- API 비용·비결정성 — 안정적 회귀에는 `rules` 모드 권장

## MCP 클라이언트

`@modelcontextprotocol/sdk`의 `StdioClientTransport`로 `npx @playwright/mcp@latest` 서브프로세스를 띄웁니다.

| 옵션 | 설명 |
|------|------|
| `--caps=testing` | `browser_verify_text_visible` 등 검증 도구 활성화 |
| `--headless` | 기본 headless (CLI `--headed`로 해제) |
| `--allowed-origins` | `.env`의 `BASE_URL` origin으로 제한 |

## 데이터

| 경로 | 역할 |
|------|------|
| `data/users-test-scenarios.csv` | 자연어 시나리오 CSV (Step·Expected Result) |
| `data/test-data.json` | 검증 메시지·입력값 |
| `data/load-test-data.js` | `.env` + JSON 병합 |
| `scripts/generate_unique_id.py` | `TEST_USER_B_ID` 갱신 |

## 결과물

| 경로 | 내용 |
|------|------|
| `results/<scenario>/run-*.json` | Step별 pass/fail 로그 |
| `results/<scenario>/step-*-failed.png` | 실패 시 스크린샷 |

HTML 리포트·`globalTeardown`은 이 프로젝트에 없습니다. 실행 로그와 스크린샷으로 결과를 확인합니다.
