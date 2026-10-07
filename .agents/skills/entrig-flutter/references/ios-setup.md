# iOS setup

Read and edit these three files. Show the diff to the user before saving each one.

## 1. `ios/Runner/AppDelegate.swift`

Read the file first. Then:

**Imports** — add at the top if not present:
```swift
import UserNotifications
import entrig
```

**Inside `didFinishLaunchingWithOptions`** — add before the `return`:
```swift
UNUserNotificationCenter.current().delegate = self
EntrigPlugin.checkLaunchNotification(launchOptions)
```

**Delegate methods** — for each of the four below, check if it already exists:
- If it does NOT exist, add the full method.
- If it DOES exist, inject the Entrig call into the existing body. Do not duplicate the method.

```swift
override func application(_ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
  EntrigPlugin.didRegisterForRemoteNotifications(deviceToken: deviceToken)
}

override func application(_ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error) {
  EntrigPlugin.didFailToRegisterForRemoteNotifications(error: error)
}

override func userNotificationCenter(_ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
  EntrigPlugin.willPresentNotification(notification)
  completionHandler(EntrigPlugin.foregroundPresentationOptions())
}

override func userNotificationCenter(_ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void) {
  EntrigPlugin.didReceiveNotification(response)
  completionHandler()
}
```

For `willPresent`: if the existing method already calls `completionHandler` with its own options, union them with `EntrigPlugin.foregroundPresentationOptions()`. Ask the user if the existing logic looks intentional.

## 2. `ios/Runner/Runner.entitlements`

If the file doesn't exist, the user must create it via Xcode — the file must be registered with Xcode's build system, not created on disk directly:

1. Open `ios/Runner.xcworkspace` in Xcode
2. Runner target → Signing & Capabilities tab
3. Click `+ Capability` → Push Notifications
4. Xcode creates `Runner.entitlements` automatically

If the file exists, add inside the root `<dict>` if not present:
```xml
<key>aps-environment</key>
<string>development</string>
```

## 3. `ios/Runner/Info.plist`

Add inside the root `<dict>` if not present:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

If `UIBackgroundModes` already exists, add `remote-notification` to the existing array if missing. Leave any other existing entries (e.g. `fetch`, `audio`) alone — they belong to the app, not to Entrig. Note that the default `flutter create` Info.plist may already include `fetch` — that's Flutter template boilerplate, not an Entrig requirement.

## After editing

- `cd ios && pod install` if pods are stale
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

Build cache issues: `flutter clean && flutter pub get && cd ios && pod install`.

