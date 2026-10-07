# Cursor MCP setup

Cursor supports MCP config through `mcp.json`.

Use project config when Entrig should be available only for this project:

```text
.cursor/mcp.json
```

Use global config when Entrig should be available in every Cursor workspace:

```text
~/.cursor/mcp.json
```

For Entrig's remote HTTP MCP, add this entry and preserve existing servers:

```json
{
  "mcpServers": {
    "entrig": {
      "type": "http",
      "url": "https://mcp.entrig.com/beta",
      "headers": {
        "Authorization": "Bearer YOUR_ENTRIG_API_KEY"
      }
    }
  }
}
```

Cursor supports interpolation in `url` and `headers`. Use interpolation only if the variable is available to Cursor:

```json
{
  "mcpServers": {
    "entrig": {
      "type": "http",
      "url": "https://mcp.entrig.com/beta",
      "headers": {
        "Authorization": "Bearer ${env:ENTRIG_API_KEY}"
      }
    }
  }
}
```

After editing `mcp.json`, restart Cursor so the MCP tool list reloads.
