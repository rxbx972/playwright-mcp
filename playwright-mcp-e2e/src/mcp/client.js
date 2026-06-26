import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { extractToolText } from './snapshot.js';

export class PlaywrightMcpClient {
  constructor({ headless = true, allowedOrigins } = {}) {
    this.headless = headless;
    this.allowedOrigins = allowedOrigins;
    this.client = null;
    this.transport = null;
    this.lastSnapshot = '';
  }

  async connect() {
    const args = ['@playwright/mcp@latest', '--caps=testing'];
    if (this.headless) args.push('--headless');
    if (this.allowedOrigins) {
      args.push('--allowed-origins', this.allowedOrigins);
    }

    this.transport = new StdioClientTransport({
      command: 'npx',
      args,
    });

    this.client = new Client(
      { name: 'playwright-mcp-e2e', version: '1.0.0' },
      { capabilities: {} }
    );

    await this.client.connect(this.transport);
  }

  async listTools() {
    const { tools } = await this.client.listTools();
    return tools;
  }

  async callTool(name, args = {}) {
    const result = await this.client.callTool({ name, arguments: args });
    const text = extractToolText(result);
    if (name === 'browser_snapshot') {
      this.lastSnapshot = text;
    }
    return { result, text };
  }

  async snapshot() {
    const { text } = await this.callTool('browser_snapshot', {});
    return text;
  }

  async close() {
    try {
      await this.callTool('browser_close', {});
    } catch {
      // browser may already be closed
    }
    if (this.client) {
      await this.client.close();
    }
  }

  toOpenAiTools(mcpTools) {
    return mcpTools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || tool.name,
        parameters: tool.inputSchema || { type: 'object', properties: {} },
      },
    }));
  }
}
