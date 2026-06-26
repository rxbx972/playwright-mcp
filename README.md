# nl-scenario-pipeline

자연어 시나리오를 시작점으로, 테스트 코드·실행·리포트까지 이어지는 자동화 파이프라인을 만듭니다.

**목표**: 지식 베이스와 함께 자연어 요청만으로 시나리오 작성 → 테스트 코드 → 실행 → 리포트  
**현재**: 자연어 Step이 담긴 CSV + Playwright Test / Playwright MCP 두 가지 실행 방식 (PoC)

```
nl-scenario-pipeline/
├── playwright-test-e2e/    # Playwright Test — 회귀·CI
├── playwright-mcp-e2e/     # Playwright MCP 러너 (rules 기본)
├── .cursor/mcp.json        # Playwright MCP (Cursor 공용)
└── README.md
```

## 프로젝트 비교

| | [playwright-test-e2e](playwright-test-e2e/) | [playwright-mcp-e2e](playwright-mcp-e2e/) |
|---|---------------------------------------------|-------------------------------------------|
| **한 줄** | CSV + `executeScenario()` + Playwright Test | CSV Step을 Playwright MCP로 실행 |
| **실행** | `npx playwright test` | `npm run run` |
| **브라우저 API** | Playwright Test (`page`, `locator`) | Playwright MCP (`browser_*` 도구) |
| **Step 해석** | `executeScenario()` 코드 | `rules`(기본) 또는 `llm`(선택) |
| **MCP 역할** | Cursor에서 UI 탐색·작성 (하이브리드) | 러너가 MCP 서버를 직접 호출 |
| **`OPENAI_API_KEY`** | 불필요 | 기본(`rules`) 불필요 · `llm` 모드만 필요 |
| **CI·회귀** | 적합 (리포트·영상·병렬) | `rules` 제한적 · `llm`은 비결정성 |
| **시나리오 CSV** | `test-data/users-test-scenarios.csv` | `data/users-test-scenarios.csv` (동일 내용) |

### playwright-test-e2e — 역할 분담

| 용도 | 도구 |
|------|------|
| UI 탐색, 셀렉터·시나리오 작성 | Playwright MCP (Cursor) |
| 자동화 실행, 리포트·영상 | Playwright Test |

### playwright-mcp-e2e — 실행 모드

| | `rules` (기본) | `llm` (선택) |
|---|----------------|--------------|
| `OPENAI_API_KEY` | 불필요 | 필요 |
| Step 해석 | `rules.js` 패턴 매칭 | OpenAI + MCP 도구 선택 |
| 적합한 경우 | 정의된 Step 회귀 | 새 Step·탐색적 실행 |

## PoC 현황

샘플 앱(Agent Studio Stage 사용자 관리)으로 파이프라인을 검증 중입니다.

> **2025-09~**: 대상 앱 UI·정책 변경으로 `users_03_02` 이후 구현 중단  
> **마지막 성공 실행 (playwright-test-e2e)**: 2025-08-04 — 9/9 통과, 21.9초

## Quick Start

**playwright-test-e2e**

```bash
cd playwright-test-e2e
cp .env.example .env
npm install && npx playwright install
npx playwright test tests/agent-studio-users-test.spec.js
```

**playwright-mcp-e2e**

```bash
cd playwright-mcp-e2e
cp .env.example .env   # BASE_URL, 계정만 설정
npm install
npm run run -- --scenario users_01_01

# (선택) llm 모드 — OPENAI_API_KEY 설정 후
npm run run:llm -- --scenario users_01_01
```

## Cursor + Playwright MCP

루트 [`.cursor/mcp.json`](.cursor/mcp.json)을 활성화하면 두 프로젝트 모두에서 MCP로 UI 탐색이 가능합니다.  
탐색·작성 가이드: [playwright-test-e2e/docs/mcp-workflow.md](playwright-test-e2e/docs/mcp-workflow.md)

---

**마지막 업데이트**: 2026년 6월 26일
