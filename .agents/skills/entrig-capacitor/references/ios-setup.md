# iOS setup

Read and edit these three files directly. Show the diff to the user before saving each one.

Capacitor iOS project files live at `ios/App/App/` (not `ios/Runner/`).

## 1. `ios/App/App/AppDelegate.swift`

Read the file first. Then:

**For each of the two methods below**, check if it already exists:
- If it does NOT exist, add the full method inside the `AppDelegate` class body.
- If it DOES exist and already posts `capacitorDidRegisterForRemoteNotifications` / `capacitorDidFailToRegisterForRemoteNotifications`, it's already wired — skip.
- If it DOES exist but does NOT post those notifications, add the `NotificationCenter.default.post(...)` call inside the existing method body.

```swift
func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
    NotificationCenter.default.post(
        name: .capacitorDidRegisterForRemoteNotifications,
        object: deviceToken
    )
}

func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
) {
    NotificationCenter.default.post(
        name: .capacitorDidFailToRegisterForRemoteNotifications,
        object: error
    )
}
```

> The plugin's `load()` method observes these `NotificationCenter` events — this is how APNs device tokens reach the Entrig SDK. No `UNUserNotificationCenterDelegate` edits are needed; the plugin owns that delegate.

## 2. `ios/App/App/App.entitlements` (or `*.entitlements`)

Search `ios/App/App/` for any `*.entitlements` file. Capacitor's default is `App.entitlements`.

**If the file does NOT exist:**

The user must add the Push Notifications capability in Xcode first — this registers the entitlements file with the Xcode build system (`project.pbxproj`), which cannot be done safely by editing files on disk:

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the **App** target → **Signing & Capabilities**
3. Click **+ Capability** → **Push Notifications**
4. Xcode creates `App.entitlements` automatically

After Xcode creates the file, edit it to ensure it contains:
```xml
<key>aps-environment</key>
<string>development</string>
```

**If the file already exists**, add inside the root `<dict>` if not present:
```xml
<key>aps-environment</key>
<string>development</string>
```

## 3. `ios/App/App/Info.plist`

Add inside the root `<dict>` if not present:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

If `UIBackgroundModes` already exists, add `remote-notification` to the existing array if missing. Leave any other existing entries (e.g. `fetch`, `audio`) alone — they belong to the app.

## After editing

- Run `npx cap sync ios` if not already done
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

Xcode SPM/build cache errors: **File → Packages → Reset Package Caches**, then **Product → Clean Build Folder** (Cmd+Shift+K), then rebuild.
