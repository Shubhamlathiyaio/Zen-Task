# Entrig MCP setup

Use this guide when the Entrig MCP tools are not available in the current session.

## Connection values

These values are the same across MCP clients:

- Server name: `entrig`
- Transport/type: HTTP / Streamable HTTP
- Server URL: `https://mcp.entrig.com/beta`
- Authentication: bearer token / API key
- Header: `Authorization: Bearer <entrig_api_key>`

The Entrig API key comes from the Entrig dashboard project settings.

## Client-specific setup

MCP registration varies by client. Read only the reference for the user's client:

- Claude Code: [clients/claude-code.md](clients/claude-code.md)
- Codex: [clients/codex.md](clients/codex.md)
- Cursor: [clients/cursor.md](clients/cursor.md)
- Windsurf: [clients/windsurf.md](clients/windsurf.md)
- Lovable: [clients/lovable.md](clients/lovable.md)

## After adding

If the MCP config is project-level, ensure that config file is in `.gitignore` because it contains the API key. Do not commit API keys.

Fully quit and relaunch the agent after adding the MCP server. Most agents fix the tool list at session start, so adding MCP config mid-session does not make tools callable until a fresh process starts.

## Verification

After restart, confirm the `entrig` server is connected using the client's MCP status UI or command.

If the server fails:
- Confirm the Entrig API key is correct.
- Confirm the agent was launched with the updated MCP config.
- Check the endpoint is reachable: `curl -i https://mcp.entrig.com/beta` should return `401` without an auth header.
