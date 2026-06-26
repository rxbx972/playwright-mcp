# playwright-mcp-e2e

[nl-scenario-pipeline](../README.md)의 **Playwright MCP** 실행 경로 — CSV 자연어 시나리오를 MCP 도구로 직접 실행합니다.

## Quick Start

**기본 실행** — Playwright MCP만 사용, `OPENAI_API_KEY` **불필요**

```bash
cp .env.example .env    # BASE_URL, TEST_USER_* 만 설정
npm install
npm run list
npm run run -- --scenario users_01_01
```

Playwright MCP 서버(`@playwright/mcp`)는 별도 API 키 없이 동작합니다.

## 실행 모드

### `rules` (기본)

- CSV Step 텍스트를 `rules.js`가 패턴 매칭해 MCP 도구(`browser_navigate`, `browser_click` 등)로 직접 호출
- **OpenAI API 키 불필요**
- 현재 지원: `users_01_01` 전체, `users_01_02` 일부
- 미지원 Step은 오류 메시지와 함께 `llm` 모드 안내

```bash
npm run run -- --scenario users_01_01
npm run run:rules -- --scenario users_01_01   # 동일
npm run run -- --scenario users_01_01 --headed
```

### `llm` (선택)

- CSV Step·Expected Result를 **OpenAI**에 넘기고, LLM이 MCP 도구 목록 중 무엇을 호출할지 결정
- Playwright MCP가 아니라 **Step 해석용 LLM** 때문에 `OPENAI_API_KEY` 필요
- 미구현·복잡한 Step을 CSV만으로 시도할 때 유용 (PoC)
- 비용·비결정성 있음

```bash
# .env에 OPENAI_API_KEY 설정 후
npm run run:llm -- --scenario users_01_01
npm run run -- --scenario users_02_01 --mode llm
```

| | `rules` (기본) | `llm` (선택) |
|---|----------------|--------------|
| `OPENAI_API_KEY` | 불필요 | **필요** |
| Step 해석 | 코드 패턴 매칭 | LLM |
| Playwright MCP | 사용 | 사용 |

## 프로젝트 구조

```
playwright-mcp-e2e/
├── config/mcp.json
├── data/
│   ├── users-test-scenarios.csv
│   ├── test-data.json
│   └── load-test-data.js
├── src/
│   ├── index.js
│   ├── mcp/
│   ├── scenario/
│   └── runners/        # rules.js (기본), llm.js (선택)
├── scripts/
└── results/
```

## 환경 변수

| 변수 | 기본 실행 (`rules`) | `llm` 모드 |
|------|---------------------|------------|
| `BASE_URL`, `TEST_USER_*` | ✓ 필수 | ✓ 필수 |
| `OPENAI_API_KEY` | 불필요 | ✓ 필수 |
| `OPENAI_MODEL` | — | 선택 (기본 `gpt-4o-mini`) |

상세: [.env.example](.env.example)

`TEST_USER_B_ID`는 실행 시 `scripts/generate_unique_id.py`가 자동 갱신합니다.

## 문서

- [docs/architecture.md](docs/architecture.md)

---

**상태**: PoC — `users_01_01` 중심 (`rules`). 복잡한 시나리오는 `llm` 모드 시도.
