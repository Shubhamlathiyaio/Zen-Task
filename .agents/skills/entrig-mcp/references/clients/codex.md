# Codex MCP setup

Codex stores MCP configuration in `config.toml`.

Use user-level config by default:

```text
~/.codex/config.toml
```

Use project-scoped config only for trusted projects:

```text
.codex/config.toml
```

The Codex CLI and IDE extension share this config.

## Recommended: environment bearer token

Set the Entrig API key in the environment that launches Codex:

```bash
export ENTRIG_API_KEY="your_key"
```

Then add this to `config.toml`:

```toml
[mcp_servers.entrig]
url = "https://mcp.entrig.com/beta"
bearer_token_env_var = "ENTRIG_API_KEY"
```

Codex sends this as the `Authorization: Bearer ...` header.

## Alternative: static header

Use only for local, uncommitted config:

```toml
[mcp_servers.entrig]
url = "https://mcp.entrig.com/beta"
http_headers = { Authorization = "Bearer YOUR_ENTRIG_API_KEY" }
```

Do not commit a real API key in `.codex/config.toml`.

## Verification

Restart Codex after editing config. In the Codex TUI, use `/mcp` to confirm `entrig` is active.
