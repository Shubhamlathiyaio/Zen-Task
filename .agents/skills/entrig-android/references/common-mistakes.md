# Common mistakes — Native Android

Extended explanations of the gotchas summarized in `SKILL.md`.

## 1. Missing `onRequestPermissionsResult` forwarding

Android delivers permission results to the Activity's `onRequestPermissionsResult`, not to libraries. There is no way for the SDK to intercept this result automatically.

Every Activity from which `Entrig.register()` may be called must forward the result:

```kotlin
override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    Entrig.onRequestPermissionsResult(requestCode, grantResults)
}
```

If `register()` is called from multiple Activities, add this override to all of them. A common pattern is to put it in a shared `BaseActivity`.

Without this, the registration callback will never fire on Android 13+ when permission is requested — the user grants or denies, and the app silently does nothing.

## 2. Hardcoding the API key

The Entrig API key authenticates devices with Entrig's backend. If it leaks (committed to a public repo, shipped decompilable in an APK), anyone can register devices against your project.

Options in priority order:

1. **`local.properties` + `BuildConfig` field** for local dev. `local.properties` is in `.gitignore` by default.
2. **CI/CD environment variable** read in `build.gradle` via `System.getenv()`.
3. **Project's existing secrets convention** — if they have one, follow it.

See [android-setup.md](android-setup.md) for exact `build.gradle` snippets.

## 3. `userId` mismatch with notification trigger

The `userId` passed to `Entrig.register()` is what Entrig uses to look up devices when delivering notifications. The notification trigger (configured in the dashboard or via MCP) specifies a "user identifier field" — the column whose value Entrig compares to registered `userId`s.

**These must match.**

With Supabase Auth, the typical flow is:
- `Entrig.register(session?.user?.id ?: "")` — registers using `auth.users.id`
- The trigger's user identifier field resolves to `auth.users.id`

If the app registers with `user.email` but the trigger expects `auth.users.id`, no devices will be found and no notifications will deliver. The integration appears to work but silently delivers nothing.

When debugging, log the `userId` at registration time and confirm it matches the value the trigger will look up.

## 4. Calling `initialize()` after `register()`

`register()` checks that the SDK is initialized and returns an error if it's not. Always call `initialize()` first — ideally in the `Application.onCreate()` before any Activity runs.

If `initialize()` is in the same Activity as `register()`, ensure the callback completes before calling `register()`. Calling both in sequence without waiting for the callback will likely fail.

## 5. Adding `google-services.json` or Firebase initialization code

A common reflex from developers who have used `firebase_messaging` or `firebase-admin` directly: they want to add `google-services.json` to the project and call `FirebaseApp.initializeApp(context)`. **Don't.**

With Entrig:
- No `google-services.json` is needed in the app.
- No `apply plugin: 'com.google.gms.google-services'` in `build.gradle`.
- No `FirebaseApp.initializeApp()` call in the app code.
- The FCM Service Account JSON is uploaded once to the Entrig dashboard.

The SDK initializes Firebase internally using its own configuration derived from the API key exchange. Adding redundant Firebase init code will cause conflicts.

## 6. Setting multiple `onNotificationOpenedListener`s

`Entrig.setOnNotificationOpenedListener` replaces the previous listener — only the last one set is active. If you call it in multiple places (e.g., `LoginActivity` and `MainActivity`), only the last assignment is effective.

Use a single listener with a `when` block on `notification.type` and extend it as new notification trigger types are added:

```kotlin
Entrig.setOnNotificationOpenedListener { notification ->
    when (notification.type) {
        "new_message" -> navigateToChat(notification.data)
        "friend_request" -> navigateToFriends()
        else -> { /* fallback */ }
    }
}
```

Set it once in `MainActivity.onCreate()` or in a central notification manager class.

## 7. Not calling `unregister()` before sign-out

If `unregister()` is skipped during sign-out, the device token remains associated with the previous user's `userId` in Entrig's backend. When that user triggers a notification from another device (or from a different session), the old device will still receive it — a potential privacy issue.

Always call `Entrig.unregister()` before `auth.signOut()`:

```kotlin
Entrig.unregister { success, _ ->
    supabaseClient.auth.signOut()
}
```

## 8. Testing on an emulator without Google Play Services

FCM (Firebase Cloud Messaging) requires Google Play Services. Standard Android emulator images (labeled `AOSP`) do not include them.

Use an emulator image that includes Google Play (labeled with the Play Store icon in AVD Manager), or test on a real Android device.

If Google Play Services are missing, `FirebaseMessaging.getInstance().token` will fail silently and no FCM token will be acquired — the device will never be registered.

## 9. Creating notifications without updating tap routing

Creating a notification trigger only configures when and to whom push notifications are delivered. It does not teach the app what to do when the user taps the notification.

After `create_notification` or `update_notification` succeeds via MCP, read the response:
- `notification_tap_contract.type`
- `notification_tap_contract.data_shape` — the exact object the SDK delivers as `notification.data`

Then update the app's existing `setOnNotificationOpenedListener` handler to route by `notification.type` and access fields from `notification.data` using the shape in `data_shape`.

After `delete_notification`, remove stale routing for `deleted_notification_tap_contract.type` from the `when` block if no remaining notification uses that type.

Do not add a second global notification-opened listener. Extend the existing `when` block.

## 10. Missing minimum SDK version

The Entrig Android SDK requires `minSdk = 24` (Android 7.0). If the app's `minSdk` is below 24, the build will succeed but the SDK will crash at runtime on older devices.

Check `app/build.gradle`:
```gradle
android {
    defaultConfig {
        minSdk = 24
    }
}
```

If the app targets older devices, consider using a `Build.VERSION.SDK_INT` guard around Entrig initialization — but note that those devices won't receive push notifications.
