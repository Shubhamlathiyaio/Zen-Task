---
name: entrig-expo
description: >
  Add Entrig push notifications to an Expo app (managed / prebuild workflow), Supabase-backed.
  Use when the user asks to set up, integrate, or add push notifications to an Expo project — managed,
  using `npx expo prebuild`, or with Expo SDK 54+, with or without EAS.
  Triggers: "Entrig" + Expo, "push notifications" + Expo + Supabase, adding `@entrig/react-native` to an
  Expo project, configuring iOS push for an Expo app, the Entrig Expo config plugin, prebuild/EAS push setup,
  registering devices for Supabase-backed push, wiring `Entrig.init` / `Entrig.register` / `useEntrigEvent`
  in an Expo app, and implementing app-side notification tap handling for Entrig notification types created via MCP.
  This skill is for Expo (managed/prebuild) ONLY. For bare React Native projects, use entrig-react-native.
metadata:
  author: entrig
  version: "1.0.3"
---

# Entrig — Expo

Wires the `@entrig/react-native` package + Entrig config plugin into an Expo project. Push notifications based on database triggers for apps built with Supabase as backend.

## Pre-flight

Read the project first:

- Is this an Expo project? (`package.json` has `expo` in `dependencies`, `app.json` or `app.config.js` has an `expo` block — if not, stop)
- Is it actually a bare React Native project? (`ios/` directory committed to source control, no `expo` block) — if so, stop and route the user to the `entrig-react-native` skill.
- What platforms are targeted? (check if `ios/` and `android/` directories exist, or what `app.json` targets)
- Do platform targets meet minimum requirements? (iOS 14.0+, Android API 24+; stop and inform the user if not)
- How is auth handled? (read `App.tsx` or `App.js` and search for sign-in/sign-out patterns)

Only ask the user about what's genuinely unclear or missing. If the Entrig API key is missing, ask them to copy it from https://app.entrig.com → project settings.

## Quick integration

### 1. Set a real Bundle Identifier

**This is the most-skipped step that breaks everything later.**

Expo's auto-generated `com.anonymous.<projectName>` does NOT work with Apple Push Notifications. You can't enable Push for a bundle ID you don't own.

Edit `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    }
  }
}
```

Use a real reverse-domain identifier. If the user already has one, keep it — just confirm it's not `com.anonymous.*`.

### 2. Install the package

```bash
npm install @entrig/react-native
# or yarn add @entrig/react-native
```

Use the command output to identify the installed latest `@entrig/react-native` package version.

### 3. Add the Entrig config plugin

Edit `app.json`:

```json
{
  "expo": {
    "plugins": ["@entrig/react-native"]
  }
}
```

If the user has existing plugins, add `"@entrig/react-native"` to the array — don't overwrite.

### 4. Run prebuild

For a fresh project where `ios/` doesn't exist yet:

```bash
npx expo prebuild
```

If `ios/` already exists (re-running after editing `app.json` to add the plugin), use `--clean` so the plugin runs against a fresh native template:

```bash
npx expo prebuild --clean
```

Warn the user before running `--clean` if there are manual edits in `ios/` or `android/` — `--clean` deletes both before regenerating.

The plugin configures:
- `AppDelegate.swift` with Entrig hooks
- `Info.plist` with `UIBackgroundModes: ["remote-notification"]`
- Entitlements with `aps-environment: development`

If prebuild fails or the native files don't get patched, see [references/expo-ios-setup.md](references/expo-ios-setup.md).

### 5. Enable Push Notifications in Apple Developer Portal

iOS-only. Skip if Android-only.

1. https://developer.apple.com/account/resources/identifiers/list
2. Pick (or register) the Bundle ID matching `app.json`.
3. Enable **Push Notifications**.
4. Save.

Without this step, the build succeeds but provisioning fails with "Your provisioning profile doesn't support Push Notifications" the first time you build to a real device.

### 6. Select your Team in Xcode

iOS-only. Skip if Android-only.

1. Open `ios/<AppName>.xcworkspace`.
2. Select the project in the navigator.
3. Signing & Capabilities tab.
4. Pick the **Team** from the dropdown.
5. Xcode auto-generates a provisioning profile that includes Push.

### 7. Initialize at app startup

```typescript
import Entrig from '@entrig/react-native';

await Entrig.init({ apiKey: process.env.EXPO_PUBLIC_ENTRIG_API_KEY });
```

**Never hardcode the key.** Use Expo's `EXPO_PUBLIC_*` env vars in a `.env` file. Add `.env` to `.gitignore`.

`Entrig.init` accepts two optional flags:

- `handlePermission` (default `true`) — when `true`, `Entrig.register(...)` automatically prompts for notification permission. Set to `false` only if the app already manages permissions itself; then call `Entrig.requestPermission()` before `Entrig.register(...)`.
- `showForegroundNotification` (default `false`) — when `true`, the system notification banner is shown while the app is in the foreground. When `false`, the banner is suppressed.

### 8. Register the device

Call `Entrig.register(userId)` with the identifier Entrig will use to look up this user from the event table when a notification is triggered. The value must match the user identifier field configured in the notification trigger.

```typescript
await Entrig.register(identifier);
```

`register` also accepts an optional `isDebug` flag — the SDK resolves this automatically, don't set it unless there's a specific need. When `true`, the device appears under **Test push notifications** in the Entrig web dashboard.

Follow the project's existing auth/session/state pattern. Call `Entrig.unregister()` when the app should stop receiving notifications for that identifier.

If `onAuthStateChange` is already used elsewhere, **extend that subscription** — don't add a second one.

### 9. Listeners

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

### 10. Notification triggers

Use the `entrig-mcp` skill to set up the MCP server and create, update, list, inspect, or delete notification triggers.

When the MCP returns `notification_tap_contract`, update the app's existing `useEntrigEvent('opened', ...)` and cold-start handling as needed. When the MCP returns `deleted_notification_tap_contract`, remove stale routing only if no remaining notification uses that type.

### 11. Verify

- iOS: `npx expo run:ios` builds and installs to a connected **real device** — simulators do NOT receive push.
- Android: `npx expo run:android` on an emulator or device with Google Play Services.

## Common mistakes

| # | Mistake | Fix |
|---|---|---|
| 1 | Using `com.anonymous.*` bundle identifier | Set a real reverse-domain bundleIdentifier in `app.json`. Apple Push won't work otherwise. |
| 2 | Skipping Apple Developer Portal Push enable | Must enable for your Bundle ID at developer.apple.com. Provisioning profile fails otherwise. |
| 3 | Forgetting to re-run `prebuild` after adding the config plugin | Plugin runs during `npx expo prebuild`. After editing `app.json` with `ios/` already present, run `npx expo prebuild --clean` (warn user it wipes manual native edits). |
| 4 | Skipping Team selection in Xcode | Open the workspace, pick a Team in Signing & Capabilities. Xcode generates the provisioning profile. |
| 5 | Testing iOS push on a simulator | Real device only — simulators won't receive. |
| 6 | Hardcoding the API key | Use `EXPO_PUBLIC_*` env vars. Add `.env` to `.gitignore`. |
| 7 | `userId` mismatch with notification trigger | The userId in `Entrig.register()` must match the user identifier field in the dashboard. With Supabase Auth, that's `session.user.id`. |
| 8 | Manual edits to `ios/` after prebuild | Prebuild regenerates `ios/`. Custom edits get wiped. Make changes part of a config plugin, or commit `ios/` and switch to bare RN. |
| 9 | Configuring FCM/APNs credentials in app code | Those go in the Entrig dashboard, not in the app. |
| 10 | Multiple `onAuthStateChange` subscriptions | Extend the existing subscription — don't add a second. |
| 11 | Adding another remote-push SDK alongside Entrig | Don't combine `expo-notifications` (for remote), `@react-native-firebase/messaging`, etc. with Entrig — they fight over the APNs token and delegate. Local notifications via `expo-notifications` are fine. |
| 12 | Calling Entrig REST API when MCP isn't loaded | Use the `entrig-mcp` skill to set up MCP instead. |
| 13 | Writing SQL or `pg_net` triggers manually | Never. Entrig manages all DB-side automatically when notifications are created via MCP. |
| 14 | Creating a notification but not updating tap routing | After MCP create/update, update opened/cold-start handlers using `notification_tap_contract.type` and `data_shape`. After delete, remove stale routing if unused. |

## References

- [references/expo-ios-setup.md](references/expo-ios-setup.md) — exact steps for bundle ID, config plugin, prebuild, dev portal, and Xcode team
- [references/common-mistakes.md](references/common-mistakes.md) — extended explanations
