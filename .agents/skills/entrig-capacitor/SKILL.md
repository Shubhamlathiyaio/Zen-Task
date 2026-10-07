---
name: entrig-capacitor
description: >
  Add Entrig push notifications to a Capacitor app (Supabase-backed). Use when the user asks to set up,
  integrate, or add push notifications to a Capacitor project — especially with Supabase Auth.
  Triggers: "Entrig" + Capacitor, "push notifications" + Capacitor + Supabase, adding the
  `@entrig/capacitor` package, configuring push for a Capacitor app, registering devices for
  Supabase-backed push, wiring `Entrig.init` / `Entrig.register` / notification listeners, and
  implementing app-side notification tap handling for Entrig notification types created via MCP.
  This skill covers Capacitor plugin integration: npm install, iOS setup command, code wiring, and
  framework-specific tap handling. Use entrig-mcp for MCP setup and notification CRUD.
metadata:
  author: entrig
  version: "1.0.2"
---

# Entrig — Capacitor

Wires the `@entrig/capacitor` plugin into a Capacitor project. Push notifications based on database triggers for apps built with Supabase as backend.

## Pre-flight

Read the project first:

- Is this a Capacitor project? (`capacitor.config.ts` or `capacitor.config.json` — if not, stop)
- What platforms are added? (check if `ios/` and `android/` directories exist via `npx cap ls`)
- Do platform targets meet minimum requirements? (iOS 14.0+, Android API 24+; stop and inform the user if not)
- How is auth handled? (search for sign-in/sign-out patterns and Supabase auth usage)

Only ask the user about what's genuinely unclear or missing. If the Entrig API key is missing, ask them to copy it from https://app.entrig.com → project settings.

## Quick integration

### 1. Install the plugin

```bash
npm install @entrig/capacitor
npx cap sync
```

Use the command output to identify the installed `@entrig/capacitor` version.

### 2. iOS setup

Read and edit the three native files directly — see [references/ios-setup.md](references/ios-setup.md) for the exact changes needed.

Also upload the **APNs `.p8` key** to https://app.entrig.com → project settings.

> The plugin owns `UNUserNotificationCenterDelegate` internally — no `willPresent`/`didReceive` edits are needed in `AppDelegate.swift`. Only the two APNs token-forwarding methods are required.

### 3. Android setup

No native Android setup required. The plugin bundles the Entrig Android SDK and wires everything automatically on `npx cap sync`.

Upload the **FCM Service Account JSON** and **Application ID** to https://app.entrig.com → project settings.

### 4. Initialize

Call `Entrig.init()` once on app startup, before any `register()` call:

```typescript
import { Entrig } from '@entrig/capacitor';

await Entrig.init({ apiKey: 'your-entrig-api-key' });
```

**Never hardcode the API key.** Use environment variables loaded at build time (e.g. via `dotenv` with Vite/Angular) or the project's existing secrets pattern.

`init()` accepts these optional fields:

- `handlePermission` (default `true`) — when `true`, `register()` automatically requests notification permission. Set to `false` only if the app manages permissions itself; then call `await Entrig.requestPermission()` before `register()`.
- `showForegroundNotification` (default `false`) — when `true`, the system notification banner is shown while the app is in the foreground. When `false`, the banner is suppressed.

### 5. Register the device

Call `Entrig.register({ userId })` with the identifier Entrig will use to look up this user when a notification is triggered. The value must match the user identifier field configured in the notification trigger.

```typescript
await Entrig.register({ userId: 'user-123' });
```

`register` also accepts an optional `isDebug` flag — the SDK resolves this automatically, don't set it unless there's a specific need. When `true`, the device appears under **Test push notifications** in the Entrig web dashboard.

Follow the project's existing auth/session/state pattern. The cleanest approach is to wire it through `onAuthStateChange`:

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    await Entrig.register({ userId: session.user.id });
  } else if (event === 'SIGNED_OUT') {
    await Entrig.unregister();
  }
});
```

Call `Entrig.unregister()` when the app should stop receiving notifications for that user.

### 6. Listeners

```typescript
Entrig.addListener('onForegroundNotification', (event) => {
  // event.title, event.body, event.type, event.data
  // Show in-app UI for foreground notification
});

Entrig.addListener('onNotificationOpened', (event) => {
  // Navigate based on event.type or event.data
});
```

Read the project's existing navigation pattern and wire `onNotificationOpened` consistently. If there is no pattern yet, a recommended approach is a `switch` on `event.type` — but follow whatever the project already uses.

Store listener handles to remove them when appropriate:

```typescript
const handle = await Entrig.addListener('onNotificationOpened', (event) => { ... });

// Later, to remove:
handle.remove();

// Or remove all at once:
await Entrig.removeAllListeners();
```

**App launched from terminated state:**

```typescript
const initial = await Entrig.getInitialNotification();
if (initial) {
  // handle cold-start tap
}
```

Call `getInitialNotification()` once — it returns `null` after the first call.

When notification triggers are created or updated via the Entrig MCP, the MCP response includes `notification_tap_contract` with the notification `type` and `data_shape` (the exact `event.data` object the SDK delivers). Immediately update the existing `onNotificationOpened` listener so tapping that notification opens the correct screen. Do not add a second listener — update the existing `switch`.

When a notification is deleted via the MCP, remove stale routing for the deleted type if no remaining notification uses that type.

### 7. Accessing notification data

`event.data` contains only the fields selected when configuring the notification trigger in Entrig.

```typescript
// Direct value (regular column or FK without relation)
const message = event.data?.message as string | undefined;
const userId = event.data?.user_id as string | undefined;

// Object value (FK with related table fields selected)
const userObject = event.data?.user_id as { name?: string } | undefined;
const userName = userObject?.name;
```

### 8. Notification triggers

Use the `entrig-mcp` skill to set up the MCP server and create, update, list, inspect, or delete notification triggers.

When the MCP returns `notification_tap_contract`, update the existing `onNotificationOpened` listener handler as described above. When the MCP returns `deleted_notification_tap_contract`, remove stale routing only if no remaining notification uses that type.

### 9. Verify

- iOS: build to a **real device** — simulators don't receive push.
- Android: build to a device or emulator with Google Play Services.
- Trigger a notification from the Entrig dashboard or via a database event.

## Common mistakes

| # | Mistake | Fix |
|---|---|---|
| 1 | Skipping `npx @entrig/capacitor setup ios` | The plugin's iOS AppDelegate hooks won't fire — APNs tokens won't reach the SDK. Run the command. |
| 2 | Skipping `npx cap sync` after install | Native platforms won't have the plugin. Always sync after `npm install`. |
| 3 | Forgetting to add Push Notifications capability in Xcode | The setup command writes files, but the Xcode capability must be added manually. |
| 4 | Hardcoding the API key | Use build-time environment variables or the project's existing secrets pattern. |
| 5 | `userId` mismatch with notification trigger | The value passed to `register()` must match the user identifier field in the notification trigger. |
| 6 | Testing iOS push on a simulator | Real device only — simulators don't receive APNs. |
| 7 | Not calling `unregister()` before sign-out | The device keeps receiving notifications for the previous user after sign-out. |
| 8 | Adding multiple `onNotificationOpened` listeners | Each `addListener` call stacks. Extend the existing listener or call `removeAllListeners()` first. |
| 9 | Not uploading FCM/APNs credentials to Entrig dashboard | Push delivery will silently fail. FCM Service Account and APNs `.p8` go in the Entrig dashboard, not in the app. |
| 10 | Creating a notification but not updating tap routing | After MCP create/update, update the `onNotificationOpened` handler using `notification_tap_contract.type` and `data_shape`. After delete, remove stale routing if unused. |

## References

- [references/ios-setup.md](references/ios-setup.md) — exact edits for AppDelegate, entitlements, and Info.plist
- [references/common-mistakes.md](references/common-mistakes.md) — extended explanations of mistakes listed above
