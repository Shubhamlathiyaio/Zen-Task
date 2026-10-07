# Windsurf MCP setup

Windsurf Cascade stores MCP config at:

```text
~/.codeium/windsurf/mcp_config.json
```

For Remote HTTP MCPs, Windsurf uses `serverUrl` or `url` plus headers.

Add this entry and preserve any existing servers:

```json
{
  "mcpServers": {
    "entrig": {
      "serverUrl": "https://mcp.entrig.com/beta",
      "headers": {
        "Authorization": "Bearer YOUR_ENTRIG_API_KEY"
      }
    }
  }
}
```

Windsurf supports interpolation in `headers`, so users can avoid hardcoding the API key:

```json
{
  "mcpServers": {
    "entrig": {
      "serverUrl": "https://mcp.entrig.com/beta",
      "headers": {
        "Authorization": "Bearer ${env:ENTRIG_API_KEY}"
      }
    }
  }
}
```

Fully restart Windsurf/Cascade after updating config so the tool list reloads.
