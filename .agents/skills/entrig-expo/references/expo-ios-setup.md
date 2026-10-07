# Expo (managed / prebuild) — iOS setup

The full flow for Expo projects. Native files are regenerated each time `npx expo prebuild` runs — the Entrig config plugin re-applies its patches on every prebuild.

## Step 1 — Set a real Bundle Identifier

Expo's auto-generated `com.anonymous.*` IDs do NOT work with Apple Push Notifications. You can't enable Push for a bundle ID you don't own.

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

Use a real reverse-domain identifier the user controls. If they don't have a domain, they can use anything unique — but it must NOT start with `com.anonymous.`.

## Step 2 — Add the Entrig config plugin

Edit `app.json`:

```json
{
  "expo": {
    "plugins": ["@entrig/react-native"]
  }
}
```

If the user already has plugins, add `"@entrig/react-native"` to the existing array — don't replace it.

## Step 3 — Run prebuild

If `ios/` doesn't exist yet (fresh project), plain prebuild is enough:

```bash
npx expo prebuild
```

If `ios/` already exists (re-running after editing `app.json` to add the plugin), use `--clean` to make sure the plugin re-runs against a fresh native template:

```bash
npx expo prebuild --clean
```

> **Warning:** `--clean` deletes `ios/` and `android/` before regenerating. If the user has manual native edits committed to those directories, they'll be lost. Switch to a custom config plugin or commit `ios/` and use the `entrig-react-native` skill instead.

Or build directly (prebuild happens automatically if `ios/` doesn't exist):

```bash
npx expo run:ios
```

The plugin runs during prebuild and configures:
- AppDelegate (`ios/<AppName>/AppDelegate.swift`) with Entrig hooks. Supports both Swift and ObjC AppDelegates.
- `Info.plist` with `UIBackgroundModes: ["remote-notification"]`.
- Entitlements with `aps-environment: development`.

## Step 4 — Enable Push Notifications in Apple Developer Portal

This is the step most users skip and then hit "provisioning profile doesn't support Push Notifications" later.

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Select the Bundle ID from `app.json` (you may need to register it if it's new).
3. Enable the **Push Notifications** capability.
4. Save.

## Step 5 — Select your development team in Xcode

1. Open `ios/<AppName>.xcworkspace` in Xcode.
2. Select the project in the navigator.
3. Signing & Capabilities tab.
4. Pick the **Team** from the dropdown.
5. Xcode auto-generates a provisioning profile that includes Push Notifications.

## Step 6 — Verify (optional but recommended)

After prebuild, check:

| File | What should be there |
|---|---|
| `ios/<AppName>/AppDelegate.swift` | `import EntrigSDK`, `import UserNotifications`, `UNUserNotificationCenterDelegate` conformance, `Entrig.checkLaunchNotification(launchOptions)` call |
| `ios/<AppName>/Info.plist` | `<key>UIBackgroundModes</key><array><string>remote-notification</string></array>` |
| `ios/<AppName>/<AppName>.entitlements` | `<key>aps-environment</key><string>development</string>` |

If any are missing, the plugin didn't run cleanly — re-run `npx expo prebuild --clean` and re-check. If they're still missing, check that `"@entrig/react-native"` is spelled exactly that way in `app.json` `plugins`, and that `@entrig/react-native` is actually installed in `node_modules`.

## Important — re-running prebuild

`npx expo prebuild` regenerates `ios/`. Custom edits to native files are lost. The Entrig config plugin re-runs each time, so the Entrig setup itself is preserved — but any *manual* tweaks the user added to AppDelegate after prebuild will be wiped.

If the user has manual native customizations, they should either:
- Make them part of a custom Expo config plugin, or
- Switch to bare RN workflow (commit the `ios/` directory to source control).

## Common errors

**"Your provisioning profile doesn't support Push Notifications"**
→ Step 4 (Apple Developer Portal) or Step 5 (Xcode team) wasn't completed.

**"Plugin '@entrig/react-native' not found"**
→ Run `npm install @entrig/react-native` first. The plugin is shipped with the npm package.

**Plugin runs but native files aren't updated**
→ Check `app.json` — make sure `"@entrig/react-native"` is in the `plugins` array spelled exactly. Then `npx expo prebuild --clean` to force regeneration.

**Different production environment**
→ Leave `aps-environment` as `development` — Xcode and App Store Connect override this to `production` automatically for distribution (App Store / TestFlight) builds. Changing it manually is not needed.

## After setup

- `npx expo run:ios` builds and installs to a connected real device.
- Simulators do NOT receive push notifications.
- For Android: `npx expo run:android` works on emulators with Google Play Services.
