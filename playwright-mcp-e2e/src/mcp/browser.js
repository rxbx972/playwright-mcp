import { findRef, snapshotIncludes } from './snapshot.js';
import { getLoginUrl } from '../scenario/placeholders.js';

export class McpBrowser {
  constructor(mcpClient) {
    this.mcp = mcpClient;
  }

  async navigate(url) {
    await this.mcp.callTool('browser_navigate', { url });
    await this.wait(500);
  }

  async wait(ms) {
    await this.mcp.callTool('browser_wait_for', { time: ms / 1000 });
  }

  async refreshSnapshot() {
    return this.mcp.snapshot();
  }

  async clickByName(name) {
    const snapshot = await this.refreshSnapshot();
    const ref = findRef(snapshot, { name });
    if (!ref) throw new Error(`요소를 찾을 수 없습니다: "${name}"`);
    await this.mcp.callTool('browser_click', { ref });
    await this.wait(300);
  }

  async typeIntoFirstTextbox(text) {
    const snapshot = await this.refreshSnapshot();
    const ref = findRef(snapshot, { role: 'textbox' });
    if (!ref) throw new Error('textbox 요소를 찾을 수 없습니다');
    await this.mcp.callTool('browser_type', { ref, text });
  }

  async typeIntoNthPassword(text, index = 0) {
    const snapshot = await this.refreshSnapshot();
    const lines = snapshot.split('\n').filter((l) => l.includes('textbox') || l.includes('password'));
    const passwordLines = lines.filter((l) => l.toLowerCase().includes('password') || l.includes('비밀번호'));
    const targetLine = passwordLines[index] || lines.find((l) => l.includes('textbox'));
    const ref = targetLine?.match(/\[ref=(e\d+)\]/)?.[1];
    if (!ref) throw new Error('비밀번호 입력 필드를 찾을 수 없습니다');
    await this.mcp.callTool('browser_type', { ref, text });
  }

  async verifyTextVisible(text) {
    try {
      await this.mcp.callTool('browser_verify_text_visible', { text });
      return true;
    } catch {
      const snapshot = await this.refreshSnapshot();
      return snapshotIncludes(snapshot, text);
    }
  }

  async login(testData) {
    await this.navigate(getLoginUrl(testData));
    await this.typeIntoFirstTextbox(testData.test_users.A.id);
    await this.typeIntoNthPassword(testData.test_users.A.password, 0);
    await this.clickByName('로그인');
    await this.wait(2000);
  }
}
