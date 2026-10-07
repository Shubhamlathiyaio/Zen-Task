# Claude Code MCP setup

Claude Code supports remote HTTP MCP servers with bearer headers. Add Entrig with local scope by default, so the API key stays private to the current user/project:

```bash
claude mcp add --transport http entrig https://mcp.entrig.com/beta \
  --header "Authorization: Bearer YOUR_ENTRIG_API_KEY"
```

Replace `YOUR_ENTRIG_API_KEY` with the Entrig API key from dashboard project settings.

Use a different scope only when intentional:

```bash
# Available across all Claude Code projects for this user
claude mcp add --transport http --scope user entrig https://mcp.entrig.com/beta \
  --header "Authorization: Bearer YOUR_ENTRIG_API_KEY"

# Shared through project .mcp.json. Avoid committing real API keys.
claude mcp add --transport http --scope project entrig https://mcp.entrig.com/beta \
  --header "Authorization: Bearer ${ENTRIG_API_KEY}"
```

If using project scope, Claude Code writes `.mcp.json` in the project root. Commit it only with environment variable expansion, never with a real API key.

Claude Code supports environment variable expansion in `.mcp.json` `url` and `headers` fields with `${VAR}` syntax. The variable must be set in the environment that launches Claude Code.

Fully quit and relaunch Claude Code after adding the server. Confirm with `/mcp` or `claude mcp list` that `entrig` is connected.
