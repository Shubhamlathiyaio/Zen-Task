# Common mistakes — Expo

Extended explanations of the gotchas summarized in `SKILL.md`.

## 1. Using `com.anonymous.*` bundle identifier

Expo auto-generates `com.anonymous.<projectName>` for new projects so they build immediately without Apple Developer setup. But **you cannot enable Push Notifications for a bundle ID you don't own** at developer.apple.com — Apple won't issue a provisioning profile for it.

Set a real reverse-domain identifier in `app.json` BEFORE the first prebuild that matters:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    }
  }
}
```

If the user already prebuilt with `com.anonymous.*`, change the ID, then `npx expo prebuild --clean` to regenerate everything with the new ID.

## 2. Skipping Apple Developer Portal Push enable

Setting `aps-environment` in entitlements is not enough. Apple's side has to know the Bundle ID is allowed to receive Push:

1. https://developer.apple.com/account/resources/identifiers/list
2. Pick (or register) the Bundle ID matching `app.json`
3. Toggle on "Push Notifications"
4. Save

Without this, the build succeeds but provisioning fails on first device build with "Your provisioning profile doesn't support Push Notifications."

## 3. Forgetting to re-run `prebuild` after adding the config plugin

The Entrig config plugin runs **only during `npx expo prebuild`** (or `npx expo run:*` which prebuilds when needed). If the user adds the plugin to `app.json` but never runs prebuild, native files won't be patched.

After adding `"plugins": ["@entrig/react-native"]`:

- If `ios/` doesn't exist yet, plain `npx expo prebuild` is enough.
- If `ios/` already exists (typical case when adding the plugin to an existing project), run `npx expo prebuild --clean` so the plugin runs against a fresh native template. Stale state from a previous prebuild may otherwise persist.

> **Warning:** `--clean` deletes `ios/` and `android/` before regenerating. Confirm with the user that they have no manual native edits there before running it. If they do, those edits need to live in a custom config plugin, or the project should commit `ios/` and switch to the `entrig-react-native` skill.

## 4. Skipping Team selection in Xcode

Even with the Apple Developer Portal step done, Xcode still needs to know which Team to use to generate the provisioning profile.

1. Open `ios/<AppName>.xcworkspace`
2. Select the project in the navigator
3. Signing & Capabilities tab
4. Pick the **Team** from the dropdown
5. Xcode auto-generates the provisioning profile

Without this, you'll see "No matching profile found" or "Signing for 'AppName' requires a development team."

## 5. Testing iOS push on a simulator

iOS simulators **cannot** receive push notifications — APNs requires a real device token. If "nothing's happening" on a simulator, the integration is fine — the test environment isn't.

Android emulators with Google Play Services **do** work for FCM push.

## 6. Hardcoding the API key

Expo reads env vars prefixed with `EXPO_PUBLIC_*` at build time:

```bash
# .env (add to .gitignore)
EXPO_PUBLIC_ENTRIG_API_KEY=ek_xxxx
```

```typescript
await Entrig.init({ apiKey: process.env.EXPO_PUBLIC_ENTRIG_API_KEY });
```

Important: `EXPO_PUBLIC_*` values are **embedded in the JS bundle** — they're visible to anyone who decompiles the app. The Entrig API key is safe for client use (it's scoped to device registration), but treat it like any other client identifier — don't reuse it as a server-side admin key.

For server-side admin operations (if you ever do them), keep a separate non-public key.

## 7. `userId` mismatch with notification trigger

The `userId` passed to `Entrig.register(userId)` is the key Entrig uses to deliver notifications to that device. The notification trigger (in the dashboard or via MCP) specifies a "user identifier field" — the column whose value Entrig looks up.

**These must match.**

With Supabase Auth, the typical flow is:
- `Entrig.register(session.user.id)` — registers using `auth.users.id`
- The trigger's user identifier resolves to `auth.users.id`

If the user registers with `session.user.email` but the trigger expects `auth.users.id`, no devices will be found. Notifications silently deliver to nobody.

Log the userId during testing if uncertain; remove the log after.

## 8. Manual edits to `ios/` after prebuild

`npx expo prebuild` regenerates `ios/`. Custom edits to native files are lost. The Entrig config plugin re-runs each time, so the Entrig setup itself is preserved — but any manual tweaks the user added to AppDelegate after prebuild will be wiped.

If the user has manual native customizations:
- Make them part of a custom Expo config plugin (so they re-apply on every prebuild), OR
- Switch to bare RN workflow (commit the `ios/` directory to source control) and use the `entrig-react-native` skill

## 9. Configuring FCM/APNs credentials in app code

A common reflex from devs who've used `@react-native-firebase/messaging`: they want to add `google-services.json` to `android/app/`, configure APNs in code, etc. **Don't** for Entrig.

With Entrig:
- FCM service account JSON → uploaded to the Entrig dashboard, NOT bundled with the app.
- APNs `.p8` key → uploaded to the Entrig dashboard, NOT in the app.
- The SDK acquires push tokens internally and reports them to Entrig's backend.

The user's app code only does `Entrig.init`, `Entrig.register`, and listeners.

## 10. Multiple `onAuthStateChange` subscriptions

If the project already subscribes to `supabase.auth.onAuthStateChange` (for navigation, profile loading, etc.), **extend the existing subscription** instead of adding a second one. Two subscriptions don't conflict, but it splits register/unregister logic and makes future debugging harder.

Place the subscription in a top-level provider or `App` component so it persists across navigation.

## 11. Adding another remote-push SDK alongside Entrig

Don't combine these with Entrig:
- `expo-notifications` used for *remote* push (its `Notifications.getDevicePushTokenAsync()` and remote handlers)
- `@react-native-firebase/messaging`
- `react-native-push-notification`

They'll fight over:
- The APNs device token (only one delegate gets it)
- The `UNUserNotificationCenterDelegate` (last one wins)
- Background notification handling

If the user has an existing remote-push integration and wants to switch to Entrig, remove the old one first.

**Local notifications are fine alongside Entrig:** `expo-notifications` used ONLY for local-scheduled notifications (its `Notifications.scheduleNotificationAsync` flow) doesn't conflict with Entrig's remote-push delivery.

## 12. Calling Entrig REST API when MCP isn't loaded

If the agent realizes the MCP tools aren't available, the wrong move is to fall back to calling Entrig's REST endpoints directly. The MCP server runs validation, schema fetching, path validation, and reasoning that REST callers must replicate — and it will be wrong.

Use the `entrig-mcp` skill to walk the user through client-specific MCP setup instead.

## 13. Writing SQL or `pg_net` triggers manually

Entrig manages all database-side setup automatically when notifications are created via MCP (or the dashboard). Writing SQL or setting up `pg_net` manually bypasses Entrig's bookkeeping and leaves the project in an inconsistent state.

If the MCP isn't available, the right answer is to add the MCP — not to do manual SQL.
