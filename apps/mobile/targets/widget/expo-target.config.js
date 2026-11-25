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
  name: 'Budget Widget',
  icon: '../../assets/icon.png',
  colors: {
    $accent: '#5046E6',
  },
  deploymentTarget: '17.0',
};
