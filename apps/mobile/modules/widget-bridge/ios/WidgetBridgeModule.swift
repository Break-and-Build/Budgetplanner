// WidgetBridgeModule — writes the current widget payload into an App
// Group's shared UserDefaults so the Budget Widget target (a separate
// process) can read it, then triggers a WidgetKit timeline reload so
// the OS repaints with the fresh data.
//
// The App Group id matches both the main app's entitlement and the
// widget target's entitlement; see `app.json` (ios.entitlements) and
// `apps/mobile/targets/widget/expo-target.config.js` (entitlements).
//
// JS boundary (see index.ts):
//   setWidgetState({ amount, daysLeft, pace, needsReview })

import ExpoModulesCore
import WidgetKit

private let appGroup = "group.com.breakandbuild.budgettracker"

/// Keys the widget reads. Kept here as constants so the Swift widget code
/// can import the same source of truth if we ever share a package.
public enum WidgetDefaultsKey {
  public static let amount = "widget.amount"
  public static let daysLeft = "widget.daysLeft"
  public static let pace = "widget.pace"
  public static let needsReview = "widget.needsReview"
  public static let updatedAt = "widget.updatedAt"
}

public class WidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    // Fire-and-forget: the JS side doesn't wait on this. If the suite is
    // nil (misconfigured entitlements, simulator quirks), we silently no-op
    // — the widget just keeps showing its last snapshot or the placeholder.
    Function("setWidgetState") { (state: WidgetState) -> Void in
      guard let defaults = UserDefaults(suiteName: appGroup) else { return }
      defaults.set(state.amount, forKey: WidgetDefaultsKey.amount)
      defaults.set(state.daysLeft, forKey: WidgetDefaultsKey.daysLeft)
      defaults.set(state.pace, forKey: WidgetDefaultsKey.pace)
      defaults.set(state.needsReview, forKey: WidgetDefaultsKey.needsReview)
      defaults.set(Date().timeIntervalSince1970, forKey: WidgetDefaultsKey.updatedAt)

      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}

/// Mirrors the JS payload shape. `pace` is an untyped string here (one of
/// "ahead" | "onPace" | "behind" | "atLimit" | "needsReview") — the widget
/// parses it on its side and falls back to onPace on an unknown value.
struct WidgetState: Record {
  @Field var amount: String = "—"
  @Field var daysLeft: Int = 0
  @Field var pace: String = "onPace"
  @Field var needsReview: Bool = false
}
