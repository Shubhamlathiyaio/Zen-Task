---
name: entrig-flutter
description: >
  Add Entrig push notifications to a Flutter app (Supabase-backed). Use when the user asks to set up,
  integrate, or add push notifications to a Flutter project — especially with Supabase Auth.
  Triggers: "Entrig" + Flutter, "push notifications" + Flutter + Supabase, adding the `entrig` Dart
  package, configuring iOS push for a Flutter app, registering devices for Supabase-backed push,
  wiring `Entrig.init` / `Entrig.register` / notification listeners, and implementing app-side
  notification tap handling for Entrig notification types created via MCP.
  This skill covers Flutter SDK integration: package install, native setup, code wiring, and
  framework-specific tap handling. Use entrig-mcp for MCP setup and notification CRUD.
metadata:
  author: entrig
  version: "1.0.2"
---

# Entrig — Flutter

Wires the `entrig` Dart package into a Flutter project. Push notifications based on database triggers for the apps built with Supabase as backend.

## Pre-flight

Read the project first:

- Is this a Flutter project? (`pubspec.yaml` with `flutter:` under `dependencies` — if not, stop)
- What platforms are targeted? (check if `ios/` and `android/` directories exist)
- Do platform targets meet minimum requirements? (iOS 14.0+, Android API 24+; stop and inform the user if not)
- How is auth handled? (read `main.dart` and search for sign-in/sign-out patterns)

Only ask the user about what's genuinely unclear or missing. If the Entrig API key is missing, ask them to copy it from https://app.entrig.com → project settings.

## Quick integration

### 1. Add dependency

```bash
flutter pub add entrig
```

Use the command output to identify the installed latest `entrig` package version.

### 2. iOS setup

Read and edit the three files directly — see [references/ios-setup.md](references/ios-setup.md) for the exact changes needed. Show the user the diff before saving each file.

If `Runner.entitlements` doesn't exist, the user must add Push Notifications capability in Xcode first (Xcode creates the file — it can't be done from the command line). See [references/ios-setup.md](references/ios-setup.md).


### 3. Initialize in `main.dart`

After `WidgetsFlutterBinding.ensureInitialized()` and after `Supabase.initialize(...)` if present:

```dart
import 'package:entrig/entrig.dart';

await Entrig.init(apiKey: const String.fromEnvironment('ENTRIG_API_KEY'));
```

**Never hardcode the key.** If the project uses `flutter_dotenv`, read from `.env` (and add to `.gitignore`). Otherwise use `--dart-define=ENTRIG_API_KEY=...` or follow the project's existing secret pattern.

`Entrig.init` accepts two optional flags:

- `handlePermission` (default `true`) — when `true`, `Entrig.register(...)` automatically prompts for notification permission. Set to `false` only if the app already manages permissions itself; then call `Entrig.requestPermission()` before `Entrig.register(...)`.
- `showForegroundNotification` (default `false`) — when `true`, the system notification banner is shown while the app is in the foreground. When `false`, the banner is suppressed.

### 4. Register the device

Call `Entrig.register(userId: ...)` with the identifier Entrig will use to look up this user from the event table when a notification is triggered. The value must match the user identifier field configured in the notification trigger.

```dart
await Entrig.register(userId: identifier);
```

`register` also accepts an optional `isDebug` flag — the SDK resolves this automatically, don't set it unless there's a specific need. When `true`, the device appears under **Test push notifications** in the Entrig web dashboard.

Follow the project's existing auth/session/state pattern. Call `Entrig.unregister()` when the app should stop receiving notifications for that identifier.

### 5. Listeners

```dart
Entrig.foregroundNotifications.listen((event) {
  // event.title, event.body, event.type, event.data
});

Entrig.onNotificationOpened.listen((event) {
  // navigate based on event.type / event.data
});
```

Read the project's existing navigation pattern and wire `onNotificationOpened` consistently. If there is no pattern yet, a recommended approach is a dedicated `PushNotificationService` class with a `switch` on `event.type` — but follow whatever the project already uses.

When notification triggers are created or updated via the Entrig MCP, the MCP response includes `notification_tap_contract` with the notification `type` and `data_shape` (the exact `event.data` object the SDK delivers). Immediately update the existing `onNotificationOpened` handler so tapping that notification opens the correct screen. Do not create a second global listener if one already exists.

When a notification is deleted via the MCP, remove stale `onNotificationOpened` routing for the deleted type if no remaining notification uses that type.

### 6. Notification triggers

Use the `entrig-mcp` skill to set up the MCP server and create, update, list, inspect, or delete notification triggers.

When the MCP returns `notification_tap_contract`, update Flutter's existing `Entrig.onNotificationOpened.listen(...)` handler as described above. When the MCP returns `deleted_notification_tap_contract`, remove stale routing only if no remaining notification uses that type.

### 7. Verify

- iOS: `cd ios && pod install` if pods are stale, then build to a **real device** (simulators don't receive push).
- Android: build to a device or emulator with Google Play Services.

## Common mistakes

| # | Mistake | Fix |
|---|---|---|
| 1 | Testing iOS push on a simulator | Real device only — simulators won't receive. |
| 2 | Hardcoding the API key | Use `--dart-define`, `flutter_dotenv`, or the project's secret pattern. |
| 3 | `userId` mismatch with notification trigger | The value passed to `Entrig.register()` must match the user identifier field configured in the notification trigger. |
| 4 | Skipping `Runner.entitlements` Xcode step | If file doesn't exist, the CLI bails. User must add Push Notifications capability in Xcode first. |
| 5 | Adding the package manually | Use `flutter pub add entrig`. |
| 6 | Stale build after pod/dep changes | `flutter clean` then `flutter run` if behavior is flaky. |
| 7 | Configuring FCM/APNs in Flutter code | Those go in the Entrig dashboard, not in the app. |
| 8 | Multiple `onAuthStateChange` listeners | Extend the existing one — don't add a second. |
| 9 | Creating a notification but not updating tap routing | After MCP create/update, update `Entrig.onNotificationOpened` using `notification_tap_contract.type` and `data_shape`. After delete, remove stale routing if unused. |


## References

- [references/ios-setup.md](references/ios-setup.md) — exact direct edits for AppDelegate, entitlements, and Info.plist
- [references/common-mistakes.md](references/common-mistakes.md) — extended mistakes with deeper explanations
