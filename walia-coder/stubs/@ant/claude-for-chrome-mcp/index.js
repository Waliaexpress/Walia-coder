/**
 * Graceful no-op stub for @ant/claude-for-chrome-mcp
 *
 * BROWSER_TOOLS: empty array — the Chrome browser integration is disabled.
 * createClaudeForChromeMcpServer: returns null and logs a disabled message
 *   so callers that check the return value handle the case without crashing.
 */
export const BROWSER_TOOLS = []

export const PermissionMode = {
  Auto: 'auto',
  Manual: 'manual',
}

export function createClaudeForChromeMcpServer(_context) {
  return null
}
