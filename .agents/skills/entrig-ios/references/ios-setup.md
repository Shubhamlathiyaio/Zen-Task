# iOS setup

Read and edit these files directly. Show the user the diff before saving each one.

## 1. `AppDelegate.swift`

Read the file first. Then:

**Imports** — add at the top if not present:
```swift
import UserNotifications
import Entrig
```

**Inside `application(_:didFinishLaunchingWithOptions:)`** — add before the `return true`:
```swift
let config = EntrigConfig(apiKey: "your-entrig-api-key")
Entrig.configure(config: config)

UNUserNotificationCenter.current().delegate = self
Entrig.checkLaunchNotification(launchOptions)
```

**APNs delegate methods** — for each of the two below, check if it already exists:
- If it does NOT exist, add the full method.
- If it DOES exist, inject the Entrig call into the existing body. Do not duplicate the method.

```swift
func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
    Entrig.didRegisterForRemoteNotifications(deviceToken: deviceToken)
}

func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
) {
    Entrig.didFailToRegisterForRemoteNotifications(error: error)
}
```

**`UNUserNotificationCenterDelegate` extension** — check if the class already conforms or has an extension for this protocol:
- If not, add the extension. If it does exist, inject the Entrig calls into the existing methods.

```swift
extension AppDelegate: UNUserNotificationCenterDelegate {

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        Entrig.willPresentNotification(notification)
        completionHandler(Entrig.getPresentationOptions())
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        Entrig.didReceiveNotification(response)
        completionHandler()
    }
}
```

For `willPresent`: if the existing method already calls `completionHandler` with its own options, union them with `Entrig.getPresentationOptions()`. Ask the user if the existing logic looks intentional.

## 2. SwiftUI apps without an AppDelegate

If the project uses a SwiftUI `@main` App struct and has no `AppDelegate`, create a new `AppDelegate.swift`. The class must subclass `NSObject` and conform to `UIApplicationDelegate`:

```swift
import UIKit
import UserNotifications
import Entrig

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let config = EntrigConfig(apiKey: "your-entrig-api-key")
        Entrig.configure(config: config)

        UNUserNotificationCenter.current().delegate = self
        Entrig.checkLaunchNotification(launchOptions)

        return true
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Entrig.didRegisterForRemoteNotifications(deviceToken: deviceToken)
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        Entrig.didFailToRegisterForRemoteNotifications(error: error)
    }
}

extension AppDelegate: UNUserNotificationCenterDelegate {

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        Entrig.willPresentNotification(notification)
        completionHandler(Entrig.getPresentationOptions())
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        Entrig.didReceiveNotification(response)
        completionHandler()
    }
}
```

Then wire it into the `@main` App struct via `@UIApplicationDelegateAdaptor`:

```swift
import SwiftUI

@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

## 3. Secrets — never hardcode the API key

**Option A: xcconfig file (recommended)**

Create `Config.xcconfig` (add to `.gitignore`):
```
ENTRIG_API_KEY = your-api-key-here
```

In `Info.plist`, add:
```xml
<key>EntrigAPIKey</key>
<string>$(ENTRIG_API_KEY)</string>
```

Read in code:
```swift
let apiKey = Bundle.main.infoDictionary?["EntrigAPIKey"] as? String ?? ""
Entrig.configure(config: EntrigConfig(apiKey: apiKey))
```

**Option B: Xcode scheme environment variable**

In the scheme editor (Product → Scheme → Edit Scheme → Run → Arguments → Environment Variables):
```
ENTRIG_API_KEY = your-api-key-here
```

Read in code:
```swift
let apiKey = ProcessInfo.processInfo.environment["ENTRIG_API_KEY"] ?? ""
```

**If the project already has a secrets convention, follow it.**

## After editing

- Build to a **real device** — simulators do not receive push notifications
- Check Xcode console for `[EntrigSDK]` logs confirming configuration and registration
