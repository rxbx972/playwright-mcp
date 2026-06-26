/** Playwright MCP 스냅샷 텍스트에서 ref 추출 */

export function extractToolText(result) {
  if (!result?.content) return '';
  return result.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n');
}

export function findRef(snapshot, { name, role } = {}) {
  const lines = snapshot.split('\n');
  for (const line of lines) {
    if (name && !line.includes(name)) continue;
    if (role && !line.toLowerCase().includes(role.toLowerCase())) continue;
    const match = line.match(/\[ref=(e\d+)\]/);
    if (match) return match[1];
  }
  return null;
}

export function findRefs(snapshot, name) {
  const refs = [];
  const lines = snapshot.split('\n');
  for (const line of lines) {
    if (!line.includes(name)) continue;
    const match = line.match(/\[ref=(e\d+)\]/);
    if (match) refs.push(match[1]);
  }
  return refs;
}

export function snapshotIncludes(snapshot, text) {
  return snapshot.includes(text);
}
