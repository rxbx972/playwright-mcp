# Contributing

## 코드 구조

```
tests/
├── agent-studio-users-test.spec.js   # CSV 시나리오 실행 + 테스트 정의
└── helpers/
    └── normalize-test-results.js     # test-results 폴더명 정규화
```

| 함수 | 역할 |
|------|------|
| `loadScenarios()` | CSV 시나리오 로드 |
| `replacePlaceholders()` | Step·Expected Result 플레이스홀더 치환 |
| `executeScenario()` | Step 텍스트 패턴 매칭으로 UI 조작·검증 |
| `performLogin()` | 공통 로그인 |
| `navigateToUserManagement()` | 사용자 관리 화면 이동 |
| `navigateToUserRegistration()` | 사용자 등록 화면 이동 |

## 새 시나리오 추가

0. **(권장)** [mcp-workflow.md](mcp-workflow.md) — Cursor Playwright MCP로 Step을 브라우저에서 먼저 확인
1. `test-data/test-data.json` — 검증 메시지·입력값 추가 (비민감 데이터)
2. `test-data/users-test-scenarios.csv` — `Scenario Id`, `Step Id`, `Step`, `Expected Result` 행 추가
3. `replacePlaceholders()` — 새 플레이스홀더 패턴 등록 (필요 시)
4. `executeScenario()` — Step·Expected Result 분기 추가
5. `agent-studio-users-test.spec.js` — `test()` 블록 추가

```javascript
test('users_XX_YY: 설명', async ({ page }) => {
    await performLogin(page, testData);
    await navigateToUserManagement(page);

    const targetScenarios = scenarios.filter(s => s['Scenario Id'] === 'users_XX_YY');
    for (const scenario of targetScenarios) {
        await executeScenario(page, scenario, testData);
    }
});
```

## 유효성 검사 메시지 추가

1. `test-data.json` → `validation_messages`에 키·값 추가
2. CSV `Expected Result`에서 `{validation_messages.새키}` 참조
3. `replacePlaceholders()`에 치환 패턴 추가
4. `executeScenario()`에 검증 분기 추가

## 결과 폴더명 커스터마이징

`tests/helpers/normalize-test-results.js`의 `extractScenarioSlug()`에 새 시나리오 ID 패턴을 추가하면 `test-results/users-XX-YY-chromium` 형식으로 정리됩니다.

## UI·정책 변경 시 점검 순서

1. **Playwright MCP** — 변경된 화면·네비게이션을 Cursor에서 직접 확인 ([mcp-workflow.md](mcp-workflow.md))
2. `users-test-scenarios.csv` — Step·Expected Result가 현행 UI와 일치하는지 확인
3. `executeScenario()` — 셀렉터·네비게이션 플로우 수정
4. `test-data.json` — 검증 메시지 문구 확인
5. 미구현 시나리오 — `users_03_02` ~ `users_05_01`, `users_lifecycle` 재개

## 로컬 실행

```bash
npx playwright test --grep "users_02_01"           # 단일 시나리오
npx playwright test --headed --reporter=list       # 디버깅
npx playwright test --grep-invert "users_lifecycle" # 통합 테스트 제외
```

설계 배경·스크립트 역할 → [architecture.md](architecture.md)  
MCP 탐색·작성 → [mcp-workflow.md](mcp-workflow.md)
