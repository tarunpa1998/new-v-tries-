# iOS and Android Application Plan

## Purpose

Plan the native Logg application for both iOS and Android while keeping one
shared source tree, one domain model, and platform-appropriate interaction
patterns.

This plan does not create the Expo project or mobile screens.

## Recommended application strategy

Use one Expo/React Native application that produces both platform builds.
Maintain platform-specific configuration and native extensions inside the same
application rather than duplicating every screen under separate iOS and
Android roots.

This gives Logg:

- One copy of transaction and reconciliation behavior.
- One offline database layer.
- One localization and API layer.
- One shared accessibility standard.
- Platform-specific navigation and native integrations where they matter.

The exact Expo SDK should be selected and pinned during implementation after
checking the supported Node, React Native, SQLite, and native AI dependencies.

## Proposed mobile source structure

The following is a target structure for implementation:

```text
apps/mobile/
├── app/                         # Expo Router entry points
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── workspace/
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── kip/
│   │   ├── reconciliation/
│   │   ├── bank-connections/
│   │   ├── budgets/
│   │   ├── goals/
│   │   ├── invoices/
│   │   └── settings/
│   ├── components/
│   ├── database/
│   ├── providers/
│   ├── navigation/
│   ├── native/
│   └── theme/
└── assets/
```

Each feature should own its API hooks, screen composition, types specific to
that feature, and testable helpers. Cross-feature domain types belong in the
shared packages, not in a screen folder.

## V1 UI library and typography decisions

The V1 frontend foundation is React Native core primitives plus a small internal
Logg component layer. Do not use a single monolithic UI kit for both platforms.

Focused libraries are planned for:

- Expo Router for navigation.
- React Native Reanimated for animation.
- React Native Gesture Handler for gestures.
- `@gorhom/bottom-sheet` for Kip, filters, and confirmations.
- `react-native-safe-area-context` for insets.
- `@shopify/flash-list` for transaction-heavy lists.
- `lucide-react-native` for consistent vector icons.
- `react-native-svg` for initial financial charts.
- React Hook Form and Zod for forms and validation.

V1 typography uses native system fonts: SF Pro/San Francisco on iOS and Roboto
on Android. The global theme index keeps font roles configurable so IBM Plex
Sans or another branded font can be evaluated later.

The complete UI stack and cold-start/profile-picker behavior are defined in
`V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`.

## Application shell

### Authentication area

- Welcome/setup.
- Email and password login.
- 2FA challenge.
- Passkey option when supported.
- Registration and password recovery.
- Native deep-link callback handling.
- Secure session restoration.

### Main application area

Recommended primary destinations:

1. Home.
2. Transactions.
3. Accounts.
4. Reconciliation or activity, depending on active-profile modules.
5. More/settings.

Kip should be the named local AI assistant and a prominent floating quick action
available from Home and Transactions. The button should be right-hand
thumb-friendly, safe-area aware, and implemented as a native-feeling sheet on
iOS and a Material-style bottom sheet on Android. It must not be the only way
to add a transaction.

Cold start should read the secure session first, then load profile summaries
from SQLite. One accessible profile opens directly; multiple profiles resume the
last valid profile or show a profile picker on first use. The picker selects a
financial context, not another person.

### Profile switching

Users may have Personal, Family, and Business profiles. Profile switching
must:

- Clearly show the active profile.
- Display Personal/Family/Business context.
- Clear or scope local queries correctly.
- Prevent one profile's cached data from appearing in another.
- Re-evaluate enabled modules after switching.
- Preserve unsent local mutations with their original internal space ID.

The account model is one login with a default Personal profile, an optional
shared Family profile for Family plans, and one or more Business profiles.
A user may have personal/family and business entitlements together. Kip always
displays the active profile, account, and currency before saving.

## Consumer experience

Default Personal profile surfaces:

- Current balance and account overview.
- Recent transactions.
- Kip quick entry.
- Budgets and spending categories.
- Goals.
- Bank connection health.
- Pending reconciliation questions.

Personal users should not see business-only invoice and tax workflows. Business
users should not see business-only workflows in their Personal profile. A
Family profile should show shared-expense features without exposing any
member's private Personal profile.

## Family experience

A Family plan should create or enable a shared Family profile. Each member keeps
a separate Personal profile, while the Family profile contains:

- Shared accounts.
- Shared transactions.
- Shared budgets and goals.
- Shared Expenses.
- Family members and permissions.

Shared Expenses is a feature within Family, not a separate duplicate ledger.

## Small-business experience

Business profile surfaces can progressively add:

- Cash-flow overview.
- Business accounts and card cycles.
- Invoices and invoice schedules.
- Receivables and payables.
- Supplier/payee management.
- VAT/MWST configuration.
- Recurring transactions and rules.
- Reports and exports.
- Attachments and receipt evidence.

Advanced fields should be progressively disclosed. The first screen should
remain useful for a café, restaurant, local shop, freelancer, or small service
business without requiring accounting expertise.

## iOS interaction plan

Use Human Interface Guidelines patterns:

- Tab bar for primary destinations.
- Navigation stack for detail and edit flows.
- Large titles where content hierarchy benefits from them.
- Bottom sheets for short choices and confirmations.
- Native date pickers and keyboard behavior.
- SF Symbols or a consistent vector icon set.
- Swipe actions on transaction rows where discoverability is clear.
- Dynamic Type and VoiceOver labels.
- Safe-area-aware bottom actions.
- Haptics only for meaningful confirmation, not decoration.

Complex actions should not be hidden only behind a swipe gesture; provide an
accessible menu or explicit action as well.

## Rich native iOS interface quality

The iOS build must feel intentionally designed for iPhone and iPad. It should
not be a web layout placed inside a native shell.

Required iOS qualities:

- Large navigation titles where the hierarchy benefits from them.
- Compact navigation titles after scrolling where appropriate.
- Native tab-bar hierarchy with no overcrowded tab bar.
- Navigation-stack detail screens with predictable back behavior.
- Grouped/inset list sections for settings and related financial data.
- Bottom sheets with sensible detents and drag indicators.
- Native date, time, currency, and confirmation controls where they improve
  comprehension.
- Context menus and swipe actions with visible alternatives.
- Toolbar actions placed according to iOS conventions.
- SF Symbols or a consistent iOS vector fallback for familiar system actions.
- Subtle materials, separators, and elevation rather than decorative card piles.
- Haptics only for confirmation, important state changes, or destructive-action
  feedback.
- Dynamic Type support without clipping or disabled font scaling.
- VoiceOver labels, hints, traits, and correct reading order.
- Safe-area-aware floating Kip action and bottom actions.
- iPad split-view or spacious two-column adaptation where appropriate.

Financial screens should use a calm hierarchy: a clear amount or title, one
primary action, supporting metadata, and progressive disclosure for advanced
fields. The interface should feel rich through spacing, typography, native
transitions, meaningful charts, and responsive states rather than through
unnecessary animation or decoration.

Every major iOS screen must pass a native-design review covering:

1. First impression and hierarchy.
2. Navigation and back behavior.
3. Sheet/list/form conventions.
4. Dynamic Type and VoiceOver.
5. Light/dark appearance.
6. Offline, loading, empty, and error states.
7. iPhone small screen, large iPhone, and iPad layout.

## Android interaction plan

Use Material 3 and Android navigation conventions:

- Material bottom navigation for primary destinations.
- Floating quick-add action where it improves Kip access.
- Material bottom sheets for choices and filters.
- Predictive back and system back support.
- Ripple and pressed states.
- Edge-to-edge layout with insets handled centrally.
- Material date/time pickers.
- TalkBack content descriptions and state announcements.
- Adaptive layouts for tablets and foldables.

## Platform differences that should be deliberate

| Area | iOS | Android |
| --- | --- | --- |
| Primary navigation | Tab bar and navigation stack | Bottom navigation and Material stack |
| Quick actions | Prominent toolbar/tab action or sheet | FAB or prominent bottom action |
| Secondary actions | Swipe action plus menu | Long press/swipe plus Material menu |
| Modal behavior | Sheet with native detents | Material bottom sheet |
| Back behavior | Navigation stack dismissal | Predictive/system back |
| Icons | SF Symbols or matched vector set | Material/vector icon set |
| Feedback | Haptics and native pressed states | Ripple, haptics where appropriate |
| Accessibility | VoiceOver/Dynamic Type | TalkBack/font scaling |

The underlying transaction data, status names, and permissions remain shared.

## Offline-first mobile data plan

The mobile app should render local data first and sync in the background:

1. Open SQLite and load the last known profile snapshot.
2. Render cached accounts and transactions immediately.
3. Show a non-blocking sync state.
4. Apply local user actions optimistically.
5. Store every mutation in the outbox with profile-space/device/client IDs.
6. Retry with backoff when connectivity returns.
7. Apply server cursor changes and conflicts.
8. Require explicit user decisions for ambiguous reconciliation.

The local schema and service concepts already drafted in `mobile/` must be
reviewed against the backend plan before implementation.

## Native capability plan

### Required early capabilities

- Secure storage.
- SQLite.
- Network status.
- Deep links.
- Keyboard and safe-area handling.
- Accessibility APIs.

### Later capabilities

- Biometrics.
- Push notifications through APNs and FCM.
- Camera and receipt attachments.
- Document/photo picker.
- Share sheet.
- Background fetch/sync.
- Native AI runtime for Kip fallback.

Every native capability must have a graceful unavailable/offline state.

## Validation matrix

Before release, test at minimum:

- iPhone small-screen and current large-screen device.
- iPad or tablet adaptive layout.
- Android small-screen and large-screen device.
- Android system back and predictive back.
- Light and dark system modes.
- Large text/accessibility font settings.
- Airplane mode during read, create, edit, and reconciliation.
- App termination with pending outbox mutations.
- Token expiry during an offline session.
- Profile switch with cached and unsent data.
