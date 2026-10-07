---
name: entrig-react-native
description: >
  Add Entrig push notifications to a React Native app (Supabase-backed). Use when the user asks
  to set up, integrate, or add push notifications to a React Native project — typically created
  with `npx react-native init` or with a hand-managed `ios/` directory.
  Triggers: "Entrig" + (React Native | RN), "push notifications" + React Native + Supabase,
  adding `@entrig/react-native`, configuring iOS push for an RN app, registering devices for
  Supabase-backed push, wiring `Entrig.init` / `Entrig.register` / `useEntrigEvent`, and implementing
  app-side notification tap handling for Entrig notification types created via MCP.
  For Expo (managed workflow) projects, use the `entrig-expo` skill instead.
metadata:
  author: entrig
  version: "1.0.2"
---

# Entrig — React Native

Wires the `@entrig/react-native` package into a React Native project. Push notifications based on database triggers for apps built with Supabase as backend.

## Pre-flight

Read the project first:

- Is this a React Native project? (`package.json` has `react-native` in `dependencies`, `ios/` directory exists at the root — if not, stop)
- Is it actually a managed Expo project? (`app.json` with an `expo` key and no checked-in `ios/` directory) — if so, stop and route the user to the `entrig-expo` skill.
- What platforms are targeted? (check if `ios/` and `android/` directories exist)
- Do platform targets meet minimum requirements? (iOS 14.0+, Android API 24+; stop and inform the user if not)
- How is auth handled? (read `App.tsx` or `App.js` and search for sign-in/sign-out patterns)

Only ask the user about what's genuinely unclear or missing. If the Entrig API key is missing, ask them to copy it from https://app.entrig.com → project settings.

## Quick integration

### 1. Install the package

```bash
npm install @entrig/react-native
# or yarn add @entrig/react-native
```

Use the command output to identify the installed latest `@entrig/react-native` package version.

### 2. iOS setup

Read and edit the files directly — see [references/ios-setup.md](references/ios-setup.md) for the exact changes needed. Show the user the diff before saving each file.

Detect the AppDelegate variant first (RN 0.74+ vs RN 0.71–0.73) — the method signatures differ. See [references/ios-setup.md](references/ios-setup.md).

### 3. Install pods

```bash
cd ios && pod install
```

Required for any new native dependency in bare RN. Verify: `grep "EntrigReactNative" ios/Podfile.lock`.

### 4. Initialize at app startup

After the app entry point is ready:

```typescript
import Entrig from '@entrig/react-native';

await Entrig.init({ apiKey: process.env.ENTRIG_API_KEY });
```

**Never hardcode the key.** Use `react-native-config` (most common in RN), `react-native-dotenv`, or the project's existing secret pattern. Add the env file to `.gitignore`.

`Entrig.init` accepts two optional flags:

- `handlePermission` (default `true`) — when `true`, `Entrig.register(...)` automatically prompts for notification permission. Set to `false` only if the app already manages permissions itself; then call `Entrig.requestPermission()` before `Entrig.register(...)`.
- `showForegroundNotification` (default `false`) — when `true`, the system notification banner is shown while the app is in the foreground. When `false`, the banner is suppressed.

### 5. Register the device

Call `Entrig.register(userId)` with the identifier Entrig will use to look up this user from the event table when a notification is triggered. The value must match the user identifier field configured in the notification trigger.

```typescript
await Entrig.register(identifier);
```

`register` also accepts an optional `isDebug` flag — the SDK resolves this automatically, don't set it unless there's a specific need. When `true`, the device appears under **Test push notifications** in the Entrig web dashboard.

Follow the project's existing auth/session/state pattern. Call `Entrig.unregister()` when the app should stop receiving notifications for that identifier.

### 6. Listeners

Use the `useEntrigEvent` hook (recommended):

```typescript
import { useEntrigEvent } from '@entrig/react-native';

useEntrigEvent('foreground', (event) => {
  // event.title, event.body, event.type, event.data
});

useEntrigEvent('opened', (event) => {
  // navigate based on event.type / event.data
});
```

Or imperative subscription (clean up on unmount):

```typescript
const sub = Entrig.onForegroundNotification((event) => { /* ... */ });
const sub2 = Entrig.onNotificationOpened((event) => { /* ... */ });
// later: sub.remove(); sub2.remove();
```

For cold-start (app launched from a tap):

```typescript
const initial = await Entrig.getInitialNotification();
if (initial) {
  // navigate based on initial.type / initial.data
}
```

Read the project's existing navigation pattern and wire `opened` and cold-start handling consistently. If there is no pattern yet, a `switch` on `event.type` is recommended — but follow whatever the project already uses.

When notification triggers are created or updated via the Entrig MCP, the MCP response includes `notification_tap_contract` with the notification `type` and `data_shape` (the exact `event.data` object the SDK delivers). Immediately update the existing opened/cold-start handlers so tapping that notification opens the correct screen. Do not create a second global listener if one already exists.

When a notification is deleted via the MCP, remove stale opened/cold-start routing for the deleted type if no remaining notification uses that type.

### 7. Notification triggers

Use the `entrig-mcp` skill to set up the MCP server and create, update, list, inspect, or delete notification triggers.

When the MCP returns `notification_tap_contract`, update the app's existing `useEntrigEvent('opened', ...)` and cold-start handling as needed. When the MCP returns `deleted_notification_tap_contract`, remove stale routing only if no remaining notification uses that type.

### 8. Verify

- iOS: build to a **real device** via Xcode or `npx react-native run-ios --device <name>` — simulators do not receive push.
- Android: `npx react-native run-android` on a device or emulator with Google Play Services.
- Trigger a test notification from the Entrig dashboard or via the MCP.

## Common mistakes

| # | Mistake | Fix |
|---|---|---|
| 1 | Testing iOS push on a simulator | Real device only — simulators won't receive. |
| 2 | Forgetting `pod install` after `npm install` | Required for every native dep in bare RN. `cd ios && pod install`. |
| 3 | "Native Entrig module not found" on iOS | Run `cd ios && pod install`. Verify `EntrigReactNative` appears in `ios/Podfile.lock`. |
| 4 | Hardcoding the API key | Use `react-native-config` or the project's existing secret pattern. |
| 5 | `userId` mismatch with notification trigger | The value passed to `Entrig.register()` must match the user identifier field configured in the notification trigger. |
| 6 | iOS files regenerated | Re-apply the direct file edits in [references/ios-setup.md](references/ios-setup.md). |
| 7 | Wrong AppDelegate method signatures | RN 0.74+ uses plain `func` (no `override`, no `super`); RN 0.71–0.73 uses `override func` with `super` calls. Read the class declaration first. See [references/ios-setup.md](references/ios-setup.md). |
| 8 | ObjC AppDelegate (RN < 0.71) | `AppDelegate.mm` needs migration to Swift before Entrig can be integrated cleanly. |
| 9 | Configuring FCM/APNs credentials in app code | Those go in the Entrig dashboard, not in the app. |
| 10 | Multiple `onAuthStateChange` subscriptions | Extend the existing subscription — don't add a second. |
| 11 | Creating a notification but not updating tap routing | After MCP create/update, update opened/cold-start handlers using `notification_tap_contract.type` and `data_shape`. After delete, remove stale routing if unused. |

## References

- [references/ios-setup.md](references/ios-setup.md) — exact direct edits for AppDelegate, entitlements, Info.plist, and project.pbxproj
- [references/common-mistakes.md](references/common-mistakes.md) — extended explanations
