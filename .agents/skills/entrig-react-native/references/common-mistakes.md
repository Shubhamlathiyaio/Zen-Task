# Common mistakes — React Native

Extended explanations of the gotchas summarized in `SKILL.md`.

## 1. Testing iOS push on a simulator

iOS simulators **cannot** receive push notifications — APNs requires a real device token. If "nothing's happening" on a simulator, the integration is fine — the test environment isn't.

Android emulators with Google Play Services **do** work for FCM push.

## 2. Forgetting `pod install` after `npm install`

Every native dependency in bare RN requires a `pod install`. The Entrig SDK is no exception.

If on Apple Silicon and pod install fails with architecture errors, try `arch -x86_64 pod install` once, then revert.

## 3. "Native Entrig module not found" on iOS

The `EntrigReactNative` pod didn't install or the build is stale. Run:

```bash
cd ios
rm -rf Pods Podfile.lock build
pod install
```

Then rebuild. Verify: `grep "EntrigReactNative" ios/Podfile.lock`.

## 4. Hardcoding the API key

Never commit the key to source control. Follow the project's existing secret pattern. If none exists, `react-native-config` is the common bare RN approach — create `.env`, add to `.gitignore`, read with `Config.ENTRIG_API_KEY`.

## 5. `userId` mismatch with notification trigger

The value passed to `Entrig.register()` is the key Entrig uses to look up the user from the event table. If it doesn't match the user identifier field configured in the notification trigger, no devices will be found and notifications will silently deliver to nobody.

Log the value during testing if uncertain; remove the log after.

## 6. iOS files regenerated

Some operations regenerate `ios/` (manual deletion, `npx react-native upgrade`, or `npx expo prebuild` if the project has drifted toward the managed/prebuild workflow). After any regeneration, re-apply the direct file edits in [ios-setup.md](ios-setup.md). If the project is actually a managed Expo project, switch to the `entrig-expo` skill — the config plugin survives prebuilds, manual edits won't.

## 7. Wrong AppDelegate method signatures

- RN 0.74+: `class AppDelegate: UIResponder, UIApplicationDelegate` — use plain `func`, no `override`, no `super`
- RN 0.71–0.73: `class AppDelegate: RCTAppDelegate` — use `override func`, call `super` on `didRegister` and `didFail`

Read the class declaration before editing. See [ios-setup.md](ios-setup.md).

## 8. ObjC AppDelegate (RN < 0.71)

`AppDelegate.mm` needs migration to Swift before Entrig can be integrated cleanly. Recommend upgrading RN first.

## 9. Configuring FCM/APNs credentials in app code

FCM service account JSON and APNs `.p8` go in the Entrig dashboard — not in the app. The SDK acquires push tokens internally and reports them to Entrig's backend. The app code only does `Entrig.init`, `Entrig.register`, and listeners.

## 10. Multiple `onAuthStateChange` subscriptions

If the project already subscribes to `onAuthStateChange`, extend the existing subscription instead of adding a second one. Place it in a top-level provider or `App` component so it persists across navigation.

## 11. Another push SDK already installed

Entrig's iOS setup is designed not to conflict — it adds delegate methods without replacing other SDKs' hooks. If another push SDK is already present, check whether it also sets `UNUserNotificationCenter.current().delegate`. If both set it, only one will receive `willPresent`/`didReceive` callbacks — whichever sets it last wins. Warn the user and check the other SDK's docs.

`@notifee/react-native` for local (in-app scheduled) notifications does not conflict — it doesn't touch remote push delegates.

## 12. Calling Entrig REST API when MCP isn't loaded

The wrong move is to fall back to calling Entrig's REST endpoints directly. Use the `entrig-mcp` skill to set up MCP instead.

## 13. Writing SQL or `pg_net` triggers manually

Entrig manages all database-side setup automatically when notifications are created via MCP. Writing SQL manually bypasses Entrig's bookkeeping and leaves the project in an inconsistent state.

## 14. Creating a notification but not updating tap routing

Creating a notification trigger only configures delivery — it doesn't teach the app what to do when the user taps it.

After `create_notification` or `update_notification`, read the MCP response:
- `notification_tap_contract.type`
- `notification_tap_contract.data_shape` — the exact object the SDK delivers as `event.data`

Update the existing `useEntrigEvent('opened', ...)` handler and cold-start handling to route by `event.type` and access fields from `event.data` using the shape in `data_shape`. Do not add a second global listener — extend the existing one.

After `delete_notification`, remove stale routing for `deleted_notification_tap_contract.type` if no remaining notification uses that type.
