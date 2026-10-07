# iOS setup

Read and edit these files directly. Show the diff to the user before saving each one.

## 1. `ios/<AppName>/AppDelegate.swift`

Read the file first. Identify the base class:

| Class declaration | Variant |
|---|---|
| `class AppDelegate: UIResponder, UIApplicationDelegate` | RN 0.74+ |
| `class AppDelegate: RCTAppDelegate` | RN 0.71–0.73 |
| `AppDelegate.mm` (Objective-C) | RN < 0.71 — migration to Swift required |

**Imports** — add at the top if not present:
```swift
import UserNotifications
import EntrigSDK
```

**Class conformance** — add `UNUserNotificationCenterDelegate`:
```swift
// RN 0.74+
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

// RN 0.71–0.73
class AppDelegate: RCTAppDelegate, UNUserNotificationCenterDelegate {
```

**Inside `didFinishLaunchingWithOptions`** — add before the `return`:
```swift
UNUserNotificationCenter.current().delegate = self
Entrig.checkLaunchNotification(launchOptions)
```

**Delegate methods** — for each of the four below, check if it already exists:
- If it does NOT exist, add the full method.
- If it DOES exist, inject the Entrig call into the existing body. Do not duplicate the method.

**RN 0.74+** (no `override`, no `super`):
```swift
func application(_ application: UIApplication,
                 didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
  Entrig.didRegisterForRemoteNotifications(deviceToken: deviceToken)
}

func application(_ application: UIApplication,
                 didFailToRegisterForRemoteNotificationsWithError error: Error) {
  Entrig.didFailToRegisterForRemoteNotifications(error: error)
}

func userNotificationCenter(_ center: UNUserNotificationCenter,
                             willPresent notification: UNNotification,
                             withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
  Entrig.willPresentNotification(notification)
  completionHandler(Entrig.getPresentationOptions())
}

func userNotificationCenter(_ center: UNUserNotificationCenter,
                             didReceive response: UNNotificationResponse,
                             withCompletionHandler completionHandler: @escaping () -> Void) {
  Entrig.didReceiveNotification(response)
  completionHandler()
}
```

**RN 0.71–0.73** (`override`, call `super` on the first two):
```swift
override func application(_ application: UIApplication,
                          didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
  Entrig.didRegisterForRemoteNotifications(deviceToken: deviceToken)
  super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
}

override func application(_ application: UIApplication,
                          didFailToRegisterForRemoteNotificationsWithError error: Error) {
  Entrig.didFailToRegisterForRemoteNotifications(error: error)
  super.application(application, didFailToRegisterForRemoteNotificationsWithError: error)
}

func userNotificationCenter(_ center: UNUserNotificationCenter,
                             willPresent notification: UNNotification,
                             withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
  Entrig.willPresentNotification(notification)
  completionHandler(Entrig.getPresentationOptions())
}

func userNotificationCenter(_ center: UNUserNotificationCenter,
                             didReceive response: UNNotificationResponse,
                             withCompletionHandler completionHandler: @escaping () -> Void) {
  Entrig.didReceiveNotification(response)
  completionHandler()
}
```

For `willPresent`: if the existing method already calls `completionHandler` with its own options, union them with `Entrig.getPresentationOptions()`. Ask the user if the existing logic looks intentional.

## 2. `ios/<AppName>/<AppName>.entitlements`

If the file doesn't exist, create it (the CLI can create this file — unlike Flutter, no Xcode capability step is needed):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>aps-environment</key>
  <string>development</string>
</dict>
</plist>
```

If the file exists, add inside the root `<dict>` if not present:
```xml
<key>aps-environment</key>
<string>development</string>
```

After creating or editing the file, verify `ios/<AppName>.xcodeproj/project.pbxproj` has a `CODE_SIGN_ENTITLEMENTS` reference pointing at it. If missing, add it — otherwise Xcode won't pick up the entitlements file.

## 3. `ios/<AppName>/Info.plist`

Add inside the root `<dict>` if not present:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

If `UIBackgroundModes` already exists, add `remote-notification` to the existing array if missing. Leave any other existing entries (e.g. `fetch`, `audio`) alone — they belong to the app, not to Entrig.

## After editing

- `cd ios && pod install`
- Build to a real iOS device — simulators do not receive push notifications

## Troubleshooting

CocoaPods errors:
```bash
cd ios
rm Podfile.lock
rm -rf Pods
pod deintegrate
pod repo update
pod install
```

Build cache issues: `cd ios && xcodebuild clean`, then rebuild.
