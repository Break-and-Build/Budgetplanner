// BudgetWidget — WidgetKit extension for Budget Tracker.
//
// Reads state from the shared App Group's UserDefaults (written by the RN
// app via modules/widget-bridge). The RN app calls WidgetCenter's reload
// on every write so timeline refreshes are prompt; this timeline also
// requests a fallback refresh every hour so the days-left counter stays
// honest if the user doesn't open the app.
//
// Design matches Home's scan-first language: eyebrow in secondary, hero
// number in semibold tabular digits, pace chip right-aligned, days-left
// context line underneath.

import WidgetKit
import SwiftUI

private let appGroup = "group.com.breakandbuild.budgettracker"

private enum DefaultsKey {
    static let amount = "widget.amount"
    static let daysLeft = "widget.daysLeft"
    static let pace = "widget.pace"
    static let needsReview = "widget.needsReview"
}

// MARK: - Entry

/// One frame in the widget's timeline. All strings are pre-formatted on the
/// RN side so the widget never has to know about currency symbols or locale.
struct BudgetEntry: TimelineEntry {
    let date: Date
    let amount: String       // "₦8,400"
    let daysLeft: Int
    let pace: PaceState
}

enum PaceState: String {
    case ahead = "Ahead of pace"
    case onPace = "On pace"
    case behind = "Behind pace"
    case atLimit = "At today's limit"
    case needsReview = "Review your plan"

    /// Parse the RN-side pace key. Unknown values fall back to onPace so a
    /// future RN version introducing a new state can't crash an older widget.
    init(fromKey key: String?) {
        switch key {
        case "ahead": self = .ahead
        case "onPace": self = .onPace
        case "behind": self = .behind
        case "atLimit": self = .atLimit
        case "needsReview": self = .needsReview
        default: self = .onPace
        }
    }
}

// MARK: - Provider

/// Supplies entries to WidgetKit. Reads the current payload from the shared
/// App Group on every refresh; the RN app triggers reloads via
/// WidgetCenter.reloadAllTimelines() on every budget state change, and this
/// timeline also schedules an hourly fallback so the widget never drifts
/// more than an hour if the app hasn't been opened.
struct BudgetProvider: TimelineProvider {
    /// Placeholder shown while the OS is composing the widget gallery or
    /// before any real data has been written. Deliberately generic so a
    /// first-launch screenshot in Settings → Widgets still reads cleanly.
    func placeholder(in context: Context) -> BudgetEntry {
        BudgetEntry(
            date: Date(),
            amount: "—",
            daysLeft: 0,
            pace: .onPace
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (BudgetEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<BudgetEntry>) -> Void) {
        let entry = currentEntry()
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: entry.date)!
        let timeline = Timeline(entries: [entry], policy: .after(nextRefresh))
        completion(timeline)
    }

    /// Read the latest payload the RN app wrote into the shared container.
    /// Falls back to "—" when the suite is missing or empty — a never-opened
    /// install or a misconfigured entitlement, respectively.
    private func currentEntry() -> BudgetEntry {
        let defaults = UserDefaults(suiteName: appGroup)
        let amount = defaults?.string(forKey: DefaultsKey.amount) ?? "—"
        let daysLeft = defaults?.integer(forKey: DefaultsKey.daysLeft) ?? 0
        let needsReview = defaults?.bool(forKey: DefaultsKey.needsReview) ?? false
        let pace: PaceState = needsReview
            ? .needsReview
            : PaceState(fromKey: defaults?.string(forKey: DefaultsKey.pace))
        return BudgetEntry(date: Date(), amount: amount, daysLeft: daysLeft, pace: pace)
    }
}

// MARK: - Views

/// Small widget (systemSmall): eyebrow, hero number, days-left line.
struct BudgetWidgetSmallView: View {
    let entry: BudgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("SAFE TODAY")
                .font(.system(size: 10, weight: .medium))
                .tracking(0.6)
                .foregroundStyle(.secondary)
            Text(entry.amount)
                .font(.system(size: 28, weight: .semibold, design: .default))
                .monospacedDigit()
                .foregroundStyle(.primary)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Spacer(minLength: 0)
            Text("\(entry.daysLeft) days left")
                .font(.system(size: 12))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(14)
    }
}

/// Medium widget (systemMedium): same hero plus pace chip on the right.
struct BudgetWidgetMediumView: View {
    let entry: BudgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("SAFE TO SPEND TODAY")
                    .font(.system(size: 10, weight: .medium))
                    .tracking(0.6)
                    .foregroundStyle(.secondary)
                Spacer()
                PaceChip(pace: entry.pace)
            }
            Text(entry.amount)
                .font(.system(size: 40, weight: .semibold, design: .default))
                .monospacedDigit()
                .foregroundStyle(.primary)
                .minimumScaleFactor(0.5)
                .lineLimit(1)
            Spacer(minLength: 0)
            Text("\(entry.daysLeft) days left this month")
                .font(.system(size: 12))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(16)
    }
}

/// Matches the Home-screen pace chip at a glance: pill background, tinted
/// text, direction arrow. Colours hardcoded here against the widget's
/// system-tint grounds; next commit may lift them into Assets.xcassets.
struct PaceChip: View {
    let pace: PaceState

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: iconName)
                .font(.system(size: 9, weight: .bold))
            Text(pace.rawValue)
                .font(.system(size: 10, weight: .semibold))
                .tracking(0.2)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Capsule().fill(background))
        .foregroundStyle(foreground)
    }

    private var iconName: String {
        switch pace {
        case .ahead: return "chevron.up"
        case .onPace: return "minus"
        case .behind: return "chevron.down"
        case .atLimit: return "xmark"
        case .needsReview: return "arrow.clockwise"
        }
    }

    private var background: Color {
        switch pace {
        case .ahead: return Color(red: 0.55, green: 0.80, blue: 0.61).opacity(0.22)
        case .onPace: return Color.secondary.opacity(0.14)
        case .behind: return Color(red: 0.89, green: 0.70, blue: 0.42).opacity(0.20)
        case .atLimit: return Color(red: 0.88, green: 0.48, blue: 0.48).opacity(0.20)
        case .needsReview: return Color.secondary.opacity(0.14)
        }
    }

    private var foreground: Color {
        switch pace {
        case .ahead: return Color(red: 0.73, green: 0.89, blue: 0.76)
        case .onPace: return .primary
        case .behind: return Color(red: 0.89, green: 0.70, blue: 0.42)
        case .atLimit: return Color(red: 0.88, green: 0.48, blue: 0.48)
        case .needsReview: return .secondary
        }
    }
}

/// Entry view selects the size-appropriate layout.
struct BudgetWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: BudgetEntry

    var body: some View {
        content
            .containerBackground(for: .widget) { Color(UIColor.systemBackground) }
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .systemSmall:
            BudgetWidgetSmallView(entry: entry)
        default:
            BudgetWidgetMediumView(entry: entry)
        }
    }
}

// MARK: - Widget bundle

@main
struct BudgetWidgetBundle: WidgetBundle {
    var body: some Widget {
        BudgetWidget()
    }
}

struct BudgetWidget: Widget {
    let kind: String = "BudgetWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BudgetProvider()) { entry in
            BudgetWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Budget Tracker")
        .description("Your safe-to-spend today, at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

#Preview(as: .systemMedium) {
    BudgetWidget()
} timeline: {
    BudgetEntry(date: .now, amount: "₦8,400", daysLeft: 18, pace: .ahead)
    BudgetEntry(date: .now, amount: "₦1,200", daysLeft: 12, pace: .behind)
    BudgetEntry(date: .now, amount: "₦0", daysLeft: 8, pace: .atLimit)
}
