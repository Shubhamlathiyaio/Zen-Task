# Common mistakes — Capacitor

Extended explanations of the gotchas summarized in `SKILL.md`.

## 1. Skipping `npx @entrig/capacitor setup ios`

The Capacitor plugin intercepts APNs device tokens via Capacitor's built-in notification center (`capacitorDidRegisterForRemoteNotifications`). For this to work, `AppDelegate.swift` must post the corresponding `NotificationCenter` events when `didRegisterForRemoteNotificationsWithDeviceToken` fires.

The setup command adds these two methods to `AppDelegate.swift` automatically. Without them, the plugin's `load()` method registers observers that never fire — no device token reaches the SDK, and `register()` silently does nothing.

If the setup command detects existing token methods and doesn't modify the file, follow its printed instructions to add the `NotificationCenter.default.post(...)` calls manually.

## 2. Skipping `npx cap sync` after install

Capacitor plugins ship native code (Swift for iOS, Kotlin for Android). This code is copied into the native projects during `cap sync`. If you install the npm package but skip the sync, the native plugin won't exist in `ios/` or `android/`, and all `Entrig.*` calls will fail silently or throw.

Always run `npx cap sync` (or `npx cap sync ios` / `npx cap sync android`) after `npm install @entrig/capacitor`.

## 3. Forgetting to add Push Notifications capability in Xcode

`npx @entrig/capacitor setup ios` writes the entitlements file and links it in `project.pbxproj`. But the **Push Notifications** capability must still be added in Xcode's Signing & Capabilities editor — this is required for Apple to issue a valid APNs entitlement during signing.

Without it, the device will fail APNs registration at runtime with "no valid 'aps-environment' entitlement."

Steps: open `ios/App/App.xcworkspace` → select the **App** target → **Signing & Capabilities** → **+ Capability** → **Push Notifications**.

## 4. Hardcoding the API key

The Entrig API key authenticates the device with Entrig's backend. If it leaks (in version control, in a public bundle), anyone can register devices against the project.

Options in priority order:

1. **Build-time env variable** via the framework's existing pattern (Vite's `import.meta.env.VITE_ENTRIG_KEY`, Angular's `environment.ts`, etc.).
2. **`.env` file** (in `.gitignore`) read at build time.
3. **Project's existing secrets convention** — if they have one, follow it.

Never commit the key to source control.

## 5. `userId` mismatch with notification trigger

The `userId` passed to `Entrig.register()` is what Entrig uses to look up devices when delivering notifications. The notification trigger specifies a "user identifier field" — the column whose value Entrig compares to registered `userId`s.

**These must match.**

With Supabase Auth, `session.user.id` is the Supabase Auth UUID. If the trigger's user identifier field points to `auth.users.id`, register with `session.user.id` — not `email`, not a custom field.

When debugging: log the `userId` at registration time and confirm it matches what the trigger will look up.

## 6. Testing iOS push on a simulator

iOS simulators cannot receive APNs push notifications. If "nothing's happening" on a simulator, the integration isn't broken — the simulator simply can't receive push. Always test on a physical iOS device connected to Xcode, or via TestFlight.

Android emulators with Google Play Services do work for FCM push.

## 7. Not calling `unregister()` before sign-out

If `unregister()` is skipped during sign-out, the device token stays associated with the previous user's `userId` in Entrig's backend. Future notifications targeting that user will arrive on this device — a privacy issue.

Always call `Entrig.unregister()` before `supabase.auth.signOut()`, or wire it through `onAuthStateChange`:

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    await Entrig.register({ userId: session.user.id });
  } else if (event === 'SIGNED_OUT') {
    await Entrig.unregister();
  }
});
```

## 8. Adding multiple `onNotificationOpened` listeners

Unlike the native iOS/Android SDKs (which replace the listener on each call), Capacitor's `addListener` stacks — each call adds a new listener and all fire independently. If `addListener('onNotificationOpened', ...)` is called multiple times (e.g. in a component that re-mounts), the handler fires multiple times per notification.

Options:
- Call `Entrig.removeAllListeners()` before re-adding.
- Store the handle returned by `addListener` and call `handle.remove()` in `onDestroy` / `ionViewWillLeave`.
- Set up listeners once at app startup and never remove them.

## 9. Not uploading FCM/APNs credentials to Entrig dashboard

Entrig delivers push notifications server-side using the credentials you upload. Without them:
- **Android:** FCM delivery fails — no notifications are ever sent.
- **iOS:** APNs delivery fails — same result.

These credentials go in the Entrig dashboard (https://app.entrig.com → project settings), not in the app code. No `google-services.json` or Firebase init code belongs in the app.

## 10. Creating notifications without updating tap routing

Creating a notification trigger only configures delivery. It does not teach the app what to do when the user taps the notification.

After `create_notification` or `update_notification` succeeds via MCP, read the response:
- `notification_tap_contract.type`
- `notification_tap_contract.data_shape` — the exact object the SDK delivers as `event.data`

Then update the app's existing `onNotificationOpened` listener to handle that type and navigate using the fields from `event.data`, shaped as in `data_shape`.

After `delete_notification`, remove stale routing for `deleted_notification_tap_contract.type` if no remaining notification uses that type.

Do not add a second `addListener('onNotificationOpened', ...)` call. Extend the existing handler.
