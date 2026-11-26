/**
 * Widget target config consumed by @bacons/apple-targets at prebuild.
 *
 * The target type `widget` scaffolds a WidgetKit extension with the Swift
 * files in this directory. `deploymentTarget` must match or exceed the main
 * app's iOS deployment target. `colors` surfaces Expo-side colour tokens into
 * the generated Assets.xcassets so the SwiftUI view can read them by name
 * (e.g. `Color("AccentColor")`); we keep it minimal here and the SwiftUI view
 * hard-codes the rest for now.
 */
/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  // Keep the display name identical to the sanitized productName. EAS's
  // configure-xcode-project phase looks up the target by its Xcode `name`
  // field (set from this `name` value) when assigning the provisioning
  // profile, but its `appExtensions.targetName` metadata is derived from
  // productName (= sanitizeNameForNonDisplayUse(name) — spaces stripped).
  // When the two diverge, EAS errors with:
  //   "Could not find target 'BudgetWidget' in project.pbxproj"
  name: 'BudgetWidget',
  icon: '../../assets/icon.png',
  colors: {
    $accent: '#5046E6',
  },
  deploymentTarget: '17.0',
  // Shared with the main app so the widget can read UserDefaults the app
  // writes via modules/widget-bridge. Group id must match both ends and
  // must be registered under the Apple Developer team; EAS Managed
  // Credentials provisions it automatically on first build.
  entitlements: {
    'com.apple.security.application-groups': [
      'group.com.breakandbuild.budgettracker',
    ],
  },
};
