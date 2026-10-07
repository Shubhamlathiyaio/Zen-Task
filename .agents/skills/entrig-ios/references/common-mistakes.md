# Common mistakes — Native iOS

Extended explanations of the gotchas summarized in `SKILL.md`.

## 1. Testing push on a simulator

iOS simulators cannot receive APNs push notifications — APNs requires a real device token from Apple's servers. If the user is testing on a simulator and "nothing's happening," the integration isn't broken — the simulator simply can't receive push. Always test on a physical iOS device.

## 2. Hardcoding the API key

The Entrig API key authenticates the device with Entrig's backend. If it leaks (committed to a public repo, shipped in the app bundle), anyone can register devices against the project.

Options in priority order:

1. **`xcconfig` file** that is `.gitignore`d, with the key injected into `Info.plist` via a build setting. Read via `Bundle.main.infoDictionary`.
2. **Xcode scheme environment variable** (Development only — doesn't survive archive builds; use xcconfig for production).
3. **Project's existing secrets convention** — if they have one, follow it.

See [ios-setup.md](ios-setup.md) for exact patterns.

## 3. `userId` mismatch with notification trigger

The `userId` passed to `Entrig.register(userId:)` is what Entrig uses to look up devices when delivering notifications. The notification trigger specifies a "user identifier field" — the column whose value Entrig compares to registered `userId`s.

**These must match.**

With Supabase Auth, the typical flow is:
- `Entrig.register(userId: session.user.id.uuidString.lowercased())` — registers using the Supabase UUID in lowercase
- The trigger's user identifier field resolves to `auth.users.id`

UUID casing matters: Supabase stores UUIDs lowercase; if the app registers with `uuidString` (uppercase), no match will be found. Always use `.uuidString.lowercased()` or `.uuidString` consistently — whichever matches what the trigger expects.

## 4. Skipping the Xcode capability step

Push Notifications and Background Modes must be added through Xcode's Signing & Capabilities editor. The CLI cannot safely create these — Xcode must register them with the project's `.pbxproj` and the entitlements file.

If the user skips this step:
- APNs registration will fail at runtime ("no valid 'aps-environment' entitlement")
- Background delivery won't work even if foreground notifications appear

Steps: target → **Signing & Capabilities** → **+ Capability** → Push Notifications, then repeat for Background Modes → enable Remote notifications.

## 5. Missing APNs delegate methods in AppDelegate

All four AppDelegate/delegate methods are required for correct behavior:

| Method | What breaks if missing |
|--------|----------------------|
| `didRegisterForRemoteNotificationsWithDeviceToken` | Device token never forwarded to SDK — registration silently fails |
| `didFailToRegisterForRemoteNotificationsWithError` | APNs errors are swallowed — no logging, hard to debug |
| `willPresent` (UNUserNotificationCenterDelegate) | Foreground notifications are suppressed by iOS (no banner, no sound) |
| `didReceive` (UNUserNotificationCenterDelegate) | Notification taps are never forwarded — `onNotificationClick` never fires |

See [ios-setup.md](ios-setup.md) for the exact method signatures.

## 6. Setting `UNUserNotificationCenter.current().delegate` too late

iOS requires the `UNUserNotificationCenterDelegate` to be set before the app finishes launching. If it's set later (e.g. in `viewDidLoad`), foreground notification delivery may not work — iOS may have already decided not to call `willPresent` because no delegate was registered.

Always set it inside `application(_:didFinishLaunchingWithOptions:)`.

## 7. Listener set on a weak/deallocated object

`Entrig.setOnForegroundNotificationListener` and `setOnNotificationOpenedListener` store weak references. If the listener object is deallocated — for example, a view controller that was dismissed — the listener silently becomes nil and callbacks stop firing.

Set listeners on a long-lived object: a root view controller, a singleton service, or `AppDelegate` itself. If notifications should route to the currently shown screen, re-register the listener in `viewWillAppear` and clear in `viewWillDisappear`.

## 8. Not calling `unregister()` before sign-out

If `unregister()` is skipped during sign-out, the device token remains associated with the previous user's `userId` in Entrig's backend. Future notifications targeting that user will still arrive on this device — a potential privacy issue.

Always call `Entrig.unregister()` before `supabase.auth.signOut()`:

```swift
Entrig.unregister { _, _ in
    Task { try? await supabase.auth.signOut() }
}
```

## 9. Creating notifications without updating tap routing

Creating a notification trigger only configures when and to whom push notifications are delivered. It does not teach the app what to do when the user taps the notification.

After `create_notification` or `update_notification` succeeds via MCP, read the response:
- `notification_tap_contract.type`
- `notification_tap_contract.data_shape` — the exact object the SDK delivers as `notification.data`

Then update the app's existing `onNotificationClick` handler to add a `case` for that type and access fields from `notification.data` using the shape in `data_shape`.

After `delete_notification`, remove the stale `case` from the `switch` if no remaining notification uses that type.

Do not add a second conformance or a second call to `setOnNotificationOpenedListener`. Extend the existing `switch notification.type` block.
