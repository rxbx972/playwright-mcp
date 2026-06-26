import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a QA automation agent executing one test step at a time.
Use the provided Playwright MCP browser tools only.
After each interaction, use browser_snapshot to verify state when needed.
Complete the Step and verify the Expected Result before finishing.
Respond with a brief Korean summary when done.`;

const MAX_TOOL_ROUNDS = 15;

export async function runStepWithLlm(mcpClient, step, expectedResult, testData) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'LLM 모드에는 OPENAI_API_KEY가 필요합니다. .env에 설정하거나 --mode rules 를 사용하세요.'
    );
  }

  const openai = new OpenAI({ apiKey });
  const mcpTools = await mcpClient.listTools();
  const tools = mcpClient.toOpenAiTools(mcpTools);

  const snapshot = await mcpClient.snapshot();

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        `## Step\n${step}`,
        `## Expected Result\n${expectedResult}`,
        `## Test data (use when needed)`,
        `- Login ID: ${testData.test_users.A.id}`,
        `- Login password: (provided in env)`,
        `- Register name: ${testData.test_users.B.name}`,
        `## Current page snapshot\n${snapshot.slice(0, 12000)}`,
      ].join('\n\n'),
    },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const message = choice.message;
    messages.push(message);

    if (!message.tool_calls?.length) {
      if (choice.finish_reason === 'stop') {
        return { summary: message.content || 'Step 완료' };
      }
      break;
    }

    for (const toolCall of message.tool_calls) {
      const name = toolCall.function.name;
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || '{}');
      } catch {
        args = {};
      }

      const { text } = await mcpClient.callTool(name, args);
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: text.slice(0, 16000) || '(no output)',
      });
    }
  }

  throw new Error(`LLM이 Step을 ${MAX_TOOL_ROUNDS}라운드 내에 완료하지 못했습니다: ${step}`);
}
