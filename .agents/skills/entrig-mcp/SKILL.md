---
name: entrig-mcp
description: >
  Set up and use the Entrig MCP server to create, update, list, inspect, and delete
  Supabase-backed push notification triggers from an AI coding agent. Use when the user
  asks to connect Entrig MCP, add Entrig as an MCP server or connector, create/manage
  notifications, troubleshoot unavailable Entrig MCP tools, or configure Entrig MCP for
  Claude Code, Cursor, Lovable, or another MCP-compatible client.
metadata:
  author: entrig
  version: "1.0.0"
---

# Entrig MCP

Use the Entrig MCP server for notification trigger management. SDK skills handle app integration; this skill handles MCP setup and notification CRUD workflow.

## Setup

If tools like `get_context`, `create_notification`, `update_notification`, `list_notifications`, `get_notifications`, and `delete_notification` are not available, read [references/setup.md](references/setup.md) and walk the user through their client's setup flow.

Do not assume every client uses `.mcp.json`. Claude Code, Cursor, Lovable, and other agents register MCP servers differently.

## Workflow

Before creating or updating notifications:
- Call `get_context` first.
- Use the returned schema, existing notification awareness, and reasoning instructions.
- Confirm the proposed notification with the user in plain language before calling `create_notification` or `update_notification`.

When managing existing notifications:
- Use `list_notifications` for compact browsing and IDs.
- Use `get_notifications` when full config, payload, conditions, or update context is needed.
- Use `delete_notification` only when the target notification ID is known and the user asked to remove it.


## Tap Handler Contract

After `create_notification` or `update_notification` succeeds, the MCP response includes `notification_tap_contract` with:
- `type` — the notification type string for routing
- `data_shape` — the exact object the SDK delivers as `event.data`, with keys and nesting matching what the app will receive at runtime

Tell the active SDK skill or coding agent to update the app-side notification tap/open handler using that contract. This is framework-specific:
- Flutter: update `Entrig.onNotificationOpened.listen(...)`.
- React Native / Expo: update `useEntrigEvent('opened', ...)`, `Entrig.onNotificationOpened(...)`, and cold-start handling where present.

After `delete_notification` succeeds, use `deleted_notification_tap_contract.type` if present to remove stale app-side routing only if no remaining notification uses that type.

The notification work is incomplete until the app knows what screen to open when the user taps the push notification.

## Unsupported Requests

If the user asks for unsupported notification behavior such as scheduled notifications, time-based triggers, batching, digests, silent push, badge counts, custom APNs/FCM headers, media attachments, or non-database-event triggers, call the MCP `feature_request` tool if available, then tell the user it is not supported yet.

## References

- [references/setup.md](references/setup.md) — client-specific MCP setup values and examples
