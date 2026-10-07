---
name: entrig-ios
description: >
  Add Entrig push notifications to a native iOS app (Supabase-backed). Use when the user asks to set up,
  integrate, or add push notifications to a native iOS/Swift project — especially with Supabase Auth.
  Triggers: "Entrig" + iOS, "push notifications" + iOS + Supabase, adding the `Entrig` Swift package,
  configuring APNs for a native iOS app, registering devices for Supabase-backed push,
  wiring `Entrig.configure` / `Entrig.register` / notification listeners, and implementing app-side
  notification tap handling for Entrig notification types created via MCP.
  This skill covers native iOS SDK integration: SPM/CocoaPods install, Xcode capability setup, AppDelegate
  wiring, code wiring, and optional Notification Service Extension. Use entrig-mcp for MCP setup and
  notification CRUD.
metadata:
  author: entrig
  version: "1.0.2"
---

# Entrig — Native iOS

Wires the `Entrig` Swift package into a native iOS project. Push notifications based on database triggers for apps built with Supabase as backend.

## Pre-flight

Read the project first:

- Is this a native iOS project? (`*.xcodeproj` or `*.xcworkspace` with Swift/Objective-C — if not, stop)
- Does the project meet minimum requirements? (iOS 14.0+, Xcode 13+, Swift 5.5+; stop and inform the user if not)
- Does the project use SwiftUI (`@main` App struct) or UIKit (`AppDelegate`)? (determines where `configure` goes)
- How is auth handled? (search for sign-in/sign-out patterns and Supabase auth usage)
- Does `AppDelegate` already exist? (SwiftUI apps may not have one)

Only ask the user about what's genuinely unclear or missing. If the Entrig API key is missing, ask them to copy it from https://app.entrig.com → project settings.

## Quick integration

### 1. Add the package

**Swift Package Manager (recommended)**

In Xcode: **File → Add Package Dependencies**, enter:
```
https://github.com/entrig/entrig-ios.git
```
Select version and add `Entrig` to the main app target.

**CocoaPods**

```ruby
pod 'EntrigSDK', '~> 1.0.1'
```
Then `pod install` and open the `.xcworkspace`.

**Minimum requirements:** iOS 14.0+, Xcode 13+, Swift 5.5+

### 2. Xcode capabilities

The user must do this in Xcode (these cannot be done from the command line):

1. Select the main app target → **Signing & Capabilities**
2. Click **+ Capability** → **Push Notifications**
3. Click **+ Capability** → **Background Modes** → enable **Remote notifications**

This creates/updates the `.entitlements` file and `Info.plist` automatically.

Also upload the **APNs `.p8` key** to https://app.entrig.com → project settings (not to the app).

### 3. Wire AppDelegate

Read and edit `AppDelegate.swift` directly — see [references/ios-setup.md](references/ios-setup.md) for the exact changes needed.

If the project uses SwiftUI with no `AppDelegate`, the user must create one and wire it via `@UIApplicationDelegateAdaptor`. See [references/ios-setup.md](references/ios-setup.md).

### 4. Configure the SDK

Inside `application(_:didFinishLaunchingWithOptions:)`, after any other SDK initializations:

```swift
import Entrig

let config = EntrigConfig(apiKey: "your-entrig-api-key")
Entrig.configure(config: config)

UNUserNotificationCenter.current().delegate = self
Entrig.checkLaunchNotification(launchOptions)
```

**Never hardcode the API key.** Use `xcconfig` files, environment variables via scheme, or the project's existing secrets pattern.

`EntrigConfig` accepts these optional parameters:

- `handlePermission` (default `true`) — when `true`, `Entrig.register()` automatically requests notification permission. Set to `false` only if the app manages permissions itself; then call `Entrig.requestPermission { granted, error in ... }` before `Entrig.register()`.
- `showForegroundNotification` (default `false`) — when `true`, the system notification banner is shown while the app is in the foreground. When `false`, the banner is suppressed.

### 5. Register the device

Call `Entrig.register(userId:)` with the identifier Entrig will use to look up this user from the event table when a notification is triggered. The value must match the user identifier field configured in the notification trigger.

```swift
Entrig.register(userId: "user-123") { success, error in
    if !success {
        print("Registration failed: \(error ?? "unknown")")
    }
}
```

`register` also accepts an optional `isDebug` flag — the SDK resolves this automatically, don't set it unless there's a specific need. When `true`, the device appears under **Test push notifications** in the Entrig web dashboard.

Follow the project's existing auth/session/state pattern. Typically call after a successful sign-in. Call `Entrig.unregister()` before sign-out.

### 6. Listeners

Listeners use Swift protocols. Set them on the object that handles navigation — typically a `UIViewController`:

```swift
// In viewDidLoad (or wherever navigation lives)
Entrig.setOnForegroundNotificationListener(self)
Entrig.setOnNotificationOpenedListener(self)
```

Conform to the protocols:

```swift
extension MyViewController: OnNotificationReceivedListener {
    func onNotificationReceived(_ notification: NotificationEvent) {
        // notification.title, notification.body, notification.type, notification.data
        // Show in-app banner, update badge, etc.
    }
}

extension MyViewController: OnNotificationClickListener {
    func onNotificationClick(_ notification: NotificationEvent) {
        switch notification.type {
        case "new_message":
            // navigate to chat
        default:
            break
        }
    }
}
```

The listeners are `weak` — the object must be retained (e.g. a presented view controller). Do not set them on a short-lived object.

**App launched from terminated state:** `Entrig.checkLaunchNotification(launchOptions)` caches the launch notification. Retrieve it with `Entrig.getInitialNotification()` — call once, returns `nil` after first call:

```swift
if let notification = Entrig.getInitialNotification() {
    // handle cold-start tap
}
```

When notification triggers are created or updated via the Entrig MCP, the MCP response includes `notification_tap_contract` with the notification `type` and `data_shape` (the exact `notification.data` object the SDK delivers). Immediately update the existing `onNotificationClick` handler so tapping that notification opens the correct screen. Do not add a second listener if one already exists — extend the existing `switch`.

When a notification is deleted via the MCP, remove stale routing for the deleted type if no remaining notification uses that type.

### 7. Unregister

Call before sign-out:

```swift
Entrig.unregister { success, _ in
    // proceed with sign-out
}
```

### 8. Accessing notification data

`notification.data` contains only the fields selected when configuring the notification trigger in Entrig.

```swift
// Direct value (regular column or FK without relation)
let message = notification.data["message"] as? String
let userId = notification.data["user_id"] as? String

// Object value (FK with related table fields selected)
if let userObject = notification.data["user_id"] as? [String: Any] {
    let userName = userObject["name"] as? String
}
```

### 9. Notification triggers

Use the `entrig-mcp` skill to set up the MCP server and create, update, list, inspect, or delete notification triggers.

When the MCP returns `notification_tap_contract`, update the existing `onNotificationClick` handler as described above. When the MCP returns `deleted_notification_tap_contract`, remove stale routing only if no remaining notification uses that type.

### 10. Verify

- Build and run on a **real device** — iOS simulators do not receive push notifications.
- Trigger a notification from the Entrig dashboard or via a database event.
- Check Xcode console for `[EntrigSDK]` logs.

## Common mistakes

| # | Mistake | Fix |
|---|---|---|
| 1 | Testing push on a simulator | Real device only — simulators don't receive APNs. |
| 2 | Hardcoding the API key | Use `xcconfig`, scheme environment variables, or the project's existing secrets pattern. |
| 3 | `userId` mismatch with notification trigger | The value passed to `Entrig.register(userId:)` must match the user identifier field in the notification trigger. |
| 4 | Skipping the Xcode capability step | Push Notifications + Background Modes must be added in Xcode; they can't be done from the command line. |
| 5 | Missing APNs delegate methods in AppDelegate | All four methods must be present — see [references/ios-setup.md](references/ios-setup.md). Missing any silently breaks registration or tap handling. |
| 6 | Setting `UNUserNotificationCenter.current().delegate` too late | Must be set in `didFinishLaunchingWithOptions` before the app finishes launching, or foreground notification delivery won't work. |
| 7 | Listener set on a weak/deallocated object | Listeners are `weak` references. Set them on a retained object (e.g. a live view controller, not a temporary one). |
| 8 | Not calling `Entrig.unregister()` before sign-out | The device keeps receiving notifications for the previous user after sign-out. |
| 9 | Creating a notification but not updating tap routing | After MCP create/update, update `onNotificationClick` using `notification_tap_contract.type` and `data_shape`. After delete, remove stale routing if unused. |

## References

- [references/ios-setup.md](references/ios-setup.md) — exact AppDelegate edits and SwiftUI adapter setup
- [references/common-mistakes.md](references/common-mistakes.md) — extended explanations of mistakes listed above
