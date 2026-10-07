---
name: entrig-android
description: >
  Add Entrig push notifications to a native Android app (Supabase-backed). Use when the user asks to set up,
  integrate, or add push notifications to a native Android project — especially with Supabase Auth.
  Triggers: "Entrig" + Android, "push notifications" + Android + Supabase, adding the `com.entrig:entrig`
  Gradle dependency, configuring FCM for a native Android app, registering devices for Supabase-backed push,
  wiring `Entrig.initialize` / `Entrig.register` / notification listeners, and implementing app-side
  notification tap handling for Entrig notification types created via MCP.
  This skill covers native Android SDK integration (Kotlin/Java): Gradle setup, manifest, code wiring, and
  permission handling. Use entrig-mcp for MCP setup and notification CRUD.
metadata:
  author: entrig
  version: "1.0.2"
---

# Entrig — Native Android

Wires the `com.entrig:entrig` library into a native Android project. Push notifications based on database triggers for apps built with Supabase as backend.

## Pre-flight

Read the project first:

- Is this a native Android project? (`build.gradle` or `build.gradle.kts` with `com.android.application` — if not, stop)
- Does the project meet minimum requirements? (Android API 24 / Android 7.0+; stop and inform the user if not)
- How is auth handled? (search for sign-in/sign-out patterns and Supabase auth usage)
- Does the project already have a custom `Application` class? (check `AndroidManifest.xml` for `android:name`)

Only ask the user about what's genuinely unclear or missing. If the Entrig API key is missing, ask them to copy it from https://app.entrig.com → project settings.

## Quick integration

### 1. Add dependency

In the app module's `build.gradle` (or `build.gradle.kts`):

```gradle
dependencies {
    implementation 'com.entrig:entrig:1.0.0'
}
```

Or Kotlin DSL:
```kotlin
dependencies {
    implementation("com.entrig:entrig:1.0.0")
}
```

The SDK is published to Maven Central — no additional repository configuration needed.

**Minimum requirements:** Android 7.0 (API 24) or higher.

### 2. Upload FCM Service Account to Entrig dashboard

The user must upload their Firebase FCM Service Account JSON to https://app.entrig.com → project settings. No `google-services.json` or Firebase initialization code is needed in the app — the SDK handles token acquisition internally.

Also provide the **Application ID** (the `applicationId` from `build.gradle`) in the Entrig dashboard.

### 3. Initialize the SDK

Initialize in the `Application` class (recommended) or in your first `Activity`:

**Application class (recommended):**
```kotlin
import com.entrig.sdk.Entrig
import com.entrig.sdk.models.EntrigConfig

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Entrig.initialize(
            this,
            EntrigConfig(apiKey = BuildConfig.ENTRIG_API_KEY)
        )
    }
}
```

Register the Application class in `AndroidManifest.xml` if not already present:
```xml
<application
    android:name=".MyApplication"
    ...>
```

**If initializing in an Activity instead:**
```kotlin
Entrig.initialize(
    this,
    EntrigConfig(apiKey = BuildConfig.ENTRIG_API_KEY)
) { success, error ->
    if (!success) Log.e("Entrig", "Init failed: $error")
}
```

`EntrigConfig` accepts these optional parameters:

- `handlePermission` (default `true`) — when `true`, `Entrig.register()` automatically requests `POST_NOTIFICATIONS` permission on Android 13+. Set to `false` only if the app manages permissions itself; then call `Entrig.requestPermission(activity)` before `Entrig.register()`.
- `showForegroundNotification` (default `false`) — when `true`, the system notification banner is shown while the app is in the foreground. When `false`, the banner is suppressed.
- `notificationChannelId` (default `"entrig_default"`) — custom notification channel ID.
- `notificationChannelName` (default `"General"`) — notification channel name shown in Android settings.

**Never hardcode the API key.** Use `BuildConfig` fields injected via `build.gradle`, environment variables at build time, or the project's existing secrets pattern.

### 4. Register the device

Call `Entrig.register(userId)` with the identifier Entrig will use to look up this user from the event table when a notification is triggered. The value must match the user identifier field configured in the notification trigger.

```kotlin
Entrig.register("user-123") { success, error ->
    if (success) {
        // Device registered for notifications
    }
}
```

Follow the project's existing auth/session/state pattern. Typically call `Entrig.register()` after a successful sign-in. Call `Entrig.unregister()` before sign-out.

On Android 13+, `register()` needs an Activity context to request `POST_NOTIFICATIONS` permission. Call it from a running Activity (on the UI thread), or pass the Activity explicitly:

```kotlin
Entrig.register(userId, activity = this) { success, error -> ... }
```

If called without an Activity and no Activity is currently resumed, the SDK will return an error: "Activity required for permission request on Android 13+."

#### Permission forwarding (required for Android 13+)

The SDK requests `POST_NOTIFICATIONS` permission automatically during `register()` on Android 13+. Android delivers permission results to the Activity's `onRequestPermissionsResult` — you must forward it to the SDK from every Activity where `register()` may be called:

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

### 5. Listeners

Set listeners after `initialize()`. These can be set in any Activity or a central class:

```kotlin
// Foreground notifications (app is open)
Entrig.setOnForegroundNotificationListener { notification ->
    // notification.title, notification.body, notification.type, notification.data
    // Show an in-app banner, snackbar, etc.
}

// Notification opened (user taps notification from any state)
Entrig.setOnNotificationOpenedListener { notification ->
    // Navigate based on notification.type or notification.data
}
```

Read the project's existing navigation pattern and wire `setOnNotificationOpenedListener` consistently. If there is no pattern yet, a recommended approach is a `switch`/`when` on `notification.type` in your main Activity — but follow whatever the project already uses.

**App launched from a terminated state:** The SDK automatically handles this via `ActivityLifecycleCallbacks`. The `onNotificationOpenedListener` fires when the Activity resumes — set it before `onResume` (e.g. in `onCreate`) so it's in place when the Activity lifecycle fires. Alternatively, use `Entrig.getInitialNotification()` to retrieve the launch notification explicitly.

```kotlin
// Optional: get launch notification explicitly
val initial = Entrig.getInitialNotification()
if (initial != null) {
    // handle initial notification
}
```

When notification triggers are created or updated via the Entrig MCP, the MCP response includes `notification_tap_contract` with the notification `type` and `data_shape` (the exact `notification.data` object the SDK delivers). Immediately update the existing `setOnNotificationOpenedListener` handler so tapping that notification opens the correct screen. Do not set a second listener if one already exists — update the existing `when` block.

When a notification is deleted via the MCP, remove stale routing for the deleted type from the listener if no remaining notification uses that type.

### 6. Unregister

Call before sign-out so the device stops receiving notifications for the current user:

```kotlin
Entrig.unregister { success, error ->
    if (success) {
        // proceed with sign-out
    }
}
```

### 7. Accessing notification data

`notification.data` contains only the fields selected when configuring the notification trigger in Entrig.

```kotlin
val data = notification.data

// Direct value (regular column or FK without relation)
val message = data?.get("message") as? String
val userId = data?.get("user_id") as? String

// Object value (FK with related table fields selected)
@Suppress("UNCHECKED_CAST")
val userObject = data?.get("user_id") as? Map<String, Any?>
val userName = userObject?.get("name") as? String
```

### 8. Notification triggers

Use the `entrig-mcp` skill to set up the MCP server and create, update, list, inspect, or delete notification triggers.

When the MCP returns `notification_tap_contract`, update the existing `setOnNotificationOpenedListener` handler as described above. When the MCP returns `deleted_notification_tap_contract`, remove stale routing only if no remaining notification uses that type.

### 9. Verify

- Build and run on a physical device or an emulator with Google Play Services.
- Trigger a notification from the Entrig dashboard or via a database event.
- Check Logcat (tag `EntrigSDK`) for initialization, registration, and delivery logs.

## Common mistakes

| # | Mistake | Fix |
|---|---|---|
| 1 | Missing `onRequestPermissionsResult` forwarding | Every Activity where `register()` may be called must forward to `Entrig.onRequestPermissionsResult()`. |
| 2 | Hardcoding the API key | Inject via `BuildConfig`, environment variable, or the project's existing secrets pattern. |
| 3 | `userId` mismatch with notification trigger | The value passed to `Entrig.register()` must match the user identifier field in the notification trigger. |
| 4 | Calling `initialize()` after `register()` | Always initialize before registering. If using an `Application` class, initialize there. |
| 5 | Adding `google-services.json` or Firebase init code | Not needed. FCM Service Account JSON is uploaded to the Entrig dashboard — not the app. |
| 6 | Setting multiple `onNotificationOpenedListener`s | Only one listener is active at a time — the last one set wins. Use a single `when` block and extend it. |
| 7 | Not calling `unregister()` before sign-out | The device keeps receiving notifications for the previous user after sign-out. |
| 8 | Testing on an emulator without Google Play Services | FCM requires Google Play Services. Use an emulator image that includes them, or a real device. |
| 9 | Creating a notification but not updating tap routing | After MCP create/update, update the `setOnNotificationOpenedListener` handler using `notification_tap_contract.type` and `data_shape`. After delete, remove stale routing if unused. |
| 10 | Missing minimum SDK version | The SDK requires API 24 (Android 7.0). Builds targeting lower will fail at runtime. |

## References

- [references/common-mistakes.md](references/common-mistakes.md) — extended explanations of mistakes listed above
