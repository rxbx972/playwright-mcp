import { getLoginUrl } from '../scenario/placeholders.js';
import { snapshotIncludes } from '../mcp/snapshot.js';

/**
 * CSV Step을 규칙 기반으로 MCP 도구 호출에 매핑합니다.
 * 미지원 Step은 LLM 모드 사용을 권장합니다.
 */
export async function runStepWithRules(browser, step, expectedResult, testData) {
  const mcp = browser.mcp;

  if (step.includes('웹 브라우저에서') && step.includes('접속')) {
    const url = step.includes('/login') ? getLoginUrl(testData) : testData.domain;
    await browser.navigate(url);
    return;
  }

  if (step.includes('로그인 화면') && step.includes('아이디') && step.includes('입력')) {
    await browser.typeIntoFirstTextbox(testData.test_users.A.id);
    return;
  }

  if (step.includes('로그인 화면') && step.includes('비밀번호') && step.includes('입력')) {
    await browser.typeIntoNthPassword(testData.test_users.A.password, 0);
    return;
  }

  if (step.includes('[로그인]') && step.includes('클릭')) {
    await browser.clickByName('로그인');
    return;
  }

  if (step.includes('로그인 완료 후') && step.includes('대기')) {
    await browser.wait(2000);
    return;
  }

  if (step.includes('로그인 성공 여부 확인')) {
    const snapshot = await browser.refreshSnapshot();
    const ok =
      snapshotIncludes(snapshot, '/dashboard') ||
      snapshotIncludes(snapshot, '로그아웃') ||
      snapshotIncludes(snapshot, '설정') ||
      snapshotIncludes(snapshot, '대시보드');
    if (!ok) throw new Error('로그인 성공 검증 실패');
    return;
  }

  if (step.includes('설정') && step.includes('찾기')) {
    const snapshot = await browser.refreshSnapshot();
    if (!snapshotIncludes(snapshot, '설정')) {
      throw new Error('설정 메뉴를 찾을 수 없습니다');
    }
    return;
  }

  if (step.includes('설정') && step.includes('클릭')) {
    await browser.clickByName('설정');
    return;
  }

  if (step.includes('사용자 관리') && step.includes('찾기')) {
    const snapshot = await browser.refreshSnapshot();
    if (!snapshotIncludes(snapshot, '사용자 관리')) {
      throw new Error('사용자 관리 메뉴를 찾을 수 없습니다');
    }
    return;
  }

  if (step.includes('사용자 관리') && step.includes('클릭')) {
    await browser.clickByName('사용자 관리');
    return;
  }

  throw new Error(
    `규칙 모드에서 지원하지 않는 Step입니다. --mode llm 으로 실행하세요.\nStep: ${step}`
  );
}
