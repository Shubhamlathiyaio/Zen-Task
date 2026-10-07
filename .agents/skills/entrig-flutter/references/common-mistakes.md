# Common mistakes — Flutter

Extended explanations of the gotchas summarized in `SKILL.md`.

## 1. Testing iOS push on a simulator

iOS simulators **cannot** receive push notifications — APNs requires a real device token. If the user is testing on a simulator and "nothing's happening," they'll think the integration is broken when it's just the simulator. Always tell them to test on a physical iOS device.

Android emulators with Google Play Services **do** work for FCM push.

## 2. Hardcoding the API key

The Entrig API key authenticates the device with Entrig's backend. If it leaks (committed to a public repo, shipped in a public app build), anyone can register devices against the project.

Options in priority order:

1. **`flutter_dotenv`** if the project already uses it. Add `ENTRIG_API_KEY` to `.env`, ensure `.env` is in `.gitignore`, and load with `dotenv.env['ENTRIG_API_KEY']`.
2. **`--dart-define=ENTRIG_API_KEY=...`** at build time. Read with `String.fromEnvironment('ENTRIG_API_KEY')`.
3. **Project's existing secrets convention** — if they have one, follow it.

Never commit the key to source control.

## 3. `userId` mismatch with notification trigger

The `userId` passed to `Entrig.register(userId: ...)` is what Entrig uses to deliver notifications to that device. The notification trigger (configured in the dashboard or via MCP) specifies a "user identifier field" — the column whose value Entrig looks up to find devices.

**These must match.**

With Supabase Auth, the typical flow is:
- `Entrig.register(userId: session.user.id)` — registers using `auth.users.id`
- The trigger's user identifier field resolves to `auth.users.id`

If the user registers with `session.user.email` but the trigger expects `auth.users.id`, no devices will be found and no notifications will deliver. The integration looks like it's working but silently delivers nothing.

When in doubt, log the `userId` being registered and confirm with the user that it matches the trigger's expected value.

## 4. Skipping the Xcode capability step for `Runner.entitlements`

`Runner.entitlements` only exists if Xcode has been told the app uses Push Notifications. The CLI can't create this file cleanly because Xcode also needs to register the capability with the project file (`project.pbxproj`).

If the user skips the Xcode step, the iOS build will succeed but APNs registration will fail at runtime — they'll see an error like "no valid 'aps-environment' entitlement string found." See [ios-setup.md](ios-setup.md) for the exact Xcode steps.

## 5. Configuring FCM/APNs in Flutter code

A common reflex from devs who've used `firebase_messaging` directly: they want to call `FirebaseMessaging.instance.getToken()` or set up `google-services.json` parsing in Dart. **Don't.**

With Entrig:
- No `google-services.json` or Firebase init code is needed in the app. The FCM service account JSON is uploaded to the Entrig dashboard.
- APNs `.p8` is uploaded to the Entrig dashboard.
- The SDK handles token acquisition internally and reports to Entrig's backend.

The user's Flutter code only does `Entrig.init`, `Entrig.register`, and listeners.

## 6. Multiple `onAuthStateChange` listeners

If the project already listens to `Supabase.instance.client.auth.onAuthStateChange` for navigation, profile loading, etc., **extend that listener** instead of adding a second one. Two listeners don't conflict, but it splits register/unregister logic across the codebase and makes future debugging harder.

## 7. Another push SDK already installed

Entrig's iOS setup is designed not to conflict — it adds delegate methods without replacing other SDKs' hooks. If another push SDK is already present (e.g. `firebase_messaging`), check whether it also sets `UNUserNotificationCenter.current().delegate`. If both set it, only one will receive `willPresent`/`didReceive` callbacks — whichever sets it last wins. Warn the user and check the other SDK's docs.

`flutter_local_notifications` for local (in-app scheduled) notifications does not conflict — it doesn't touch remote push delegates.

## 8. Creating notifications without updating tap routing

Creating a notification trigger only configures delivery. It does not automatically teach the app what to do when the user taps the push notification.

After `create_notification` or `update_notification` succeeds, read the MCP response:
- `notification_tap_contract.type`
- `notification_tap_contract.data_shape` — the exact object the SDK delivers as `event.data`

Then update the Flutter app's existing `Entrig.onNotificationOpened.listen(...)` handler to route by `event.type` and access fields from `event.data` using the shape in `data_shape`.

After `delete_notification` succeeds, remove stale routing for `deleted_notification_tap_contract.type` if no remaining notification uses that type.

Do not add a second global notification-opened listener. Extend the existing handler or central push notification service.
