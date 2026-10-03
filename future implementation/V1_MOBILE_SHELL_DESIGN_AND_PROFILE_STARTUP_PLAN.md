# V1 Mobile Shell, UI Stack, and Profile Startup Plan

## Purpose

Record the V1 decisions for the iOS and Android frontend shell, typography,
focused UI libraries, cold-start behavior, profile selection, and profile-safe
navigation.

This document contains planning decisions only. It does not add application
code.

## Design guidance source

Repository skill discovery did not find a dedicated Apple/iOS design skill.
Use the official Apple Human Interface Guidelines and Android Material 3
guidance alongside the repository's existing mobile and UI/UX guidance. The
quality bar is native behavior and deliberate visual hierarchy, not a copied
web layout or a generic component-library demo.

The complete V1 build order, including current web feature parity and Kip, is
defined in `V1_BUILD_PLAN.md`.

## V1 mobile frontend stack

### UI foundation

Use React Native core primitives as the foundation:

- View.
- Text.
- Pressable.
- ScrollView.
- TextInput.
- Modal.
- Switch.
- Platform accessibility primitives.

Build a small internal Logg mobile component layer on top of these primitives.
Do not use a single large UI kit to force one visual language onto both
platforms.

This allows the app to follow:

- Apple Human Interface Guidelines on iOS.
- Material-style behavior and Android navigation on Android.
- Shared Logg financial patterns across both platforms.

### Focused libraries

| Need | Planned library | Use |
| --- | --- | --- |
| Navigation | Expo Router | Auth, profiles, tabs, details, deep links |
| Animation | React Native Reanimated | Native-feeling transitions and state changes |
| Gestures | React Native Gesture Handler | Swipe actions and gesture interaction |
| Sheets | `@gorhom/bottom-sheet` | Kip, filters, confirmations, selectors |
| Safe areas | `react-native-safe-area-context` | Notches, home indicators, system bars |
| Lists | `@shopify/flash-list` | Transactions, accounts, invoices, candidates |
| Icons | `lucide-react-native` | Consistent vector icons without emoji |
| Charts | `react-native-svg` initially | Financial charts and custom data visuals |
| Forms | React Hook Form | Login, transactions, invoices, settings |
| Validation | Zod | Shared structured input/output validation |
| Local storage | SQLite adapter | Cached data, outbox, pending transactions |
| Secure storage | Native secure storage | Tokens and protected session data |

The exact package versions must be checked against the selected Expo SDK and
React Native version before implementation. A library is not approved solely
because it works on the web.

### Libraries intentionally not used as the V1 foundation

- React Native Paper as the entire design system, because it is primarily
  Material-oriented and can make iOS feel like Android.
- Web Tailwind, shadcn, Radix, or React DOM components.
- Emoji as interface icons.
- A large chart library before the required chart types are known.
- Multiple SQLite bindings in the first release.

## Typography decision

Use native system fonts for V1:

- iOS: San Francisco/SF Pro system typography.
- Android: Roboto system typography.

System typography provides:

- Native platform appearance.
- Better accessibility scaling.
- Lower app size.
- Faster startup.
- No custom-font loading failure.

The global theme index must still expose typography roles so the font can be
changed later without editing screens:

- Display amount.
- Screen title.
- Section title.
- Body.
- Body emphasis.
- Label.
- Caption.
- Button label.
- Numeric amount.
- Compact numeric amount.
- Technical/monospace value.

IBM Plex Sans may be evaluated later as a branded cross-platform font. Geist
remains the current web identity and should not be forced into the native app
until a font comparison is completed on both platforms with large text enabled.

## Global styling source

All mobile components must consume the planned global theme index:

```text
apps/mobile/src/theme/index.ts
```

The index controls:

- Light and dark semantic colors.
- Typography roles and font configuration.
- Spacing.
- Radii.
- Borders and dividers.
- Elevation and shadows.
- Motion durations.
- Reduced-motion behavior.
- Icon sizes.
- Touch targets.
- Button variants.
- Inputs and validation states.
- Cards and lists.
- Tabs and navigation.
- Bottom sheets.
- Kip floating action.
- Financial status colors.
- Loading, empty, error, and offline states.

Screen-level raw colors, arbitrary font sizes, and unrelated spacing values are
not allowed.

## Cold-start flow

The app must validate the secure session before reading user data.

```text
Native splash
    ↓
Load secure session/token
    ├── No valid session → Login/authentication
    └── Valid session
            ↓
      Read profile summaries from SQLite
            ├── 0 profiles → Onboarding/setup
            ├── 1 active profile → Open it directly
            └── Multiple profiles
                    ├── Recent active profile exists
                    │       → Resume it with a clear profile header
                    └── First use/no recent profile
                            → Profile picker
            ↓
      Load cached profile data
            ↓
      Open the profile dashboard
            ↓
      Synchronize in the background
```

The local profile list must be scoped to the authenticated user. A logged-out
user must not see cached profile names or financial data.

## Profile count behavior

### Zero profiles

Send the user through setup. The first profile is normally Personal, with
optional persona-based category templates.

### One profile

Open it directly without showing a picker. The profile can be Personal, Family,
or Business; the logic must not assume it is always Personal.

### Multiple profiles

On first use, show the profile picker. On later launches, resume the last active
profile when it is still accessible and valid.

Show the picker again when:

- The user explicitly chooses Switch profile.
- A new profile is added.
- The last profile is archived or access is removed.
- The authenticated user changes.
- The profile requires an important entitlement or invitation decision.

This avoids repeated startup friction while preserving profile safety.

## Profile picker language

Do not use “Who is logging today?” because the authenticated person is already
known. The picker is selecting a financial context, not another identity.

Use language such as:

- Choose your profile.
- Where are you managing money?
- Choose a financial space.

Profile cards should show:

- Profile name.
- Profile type.
- Icon/color.
- Family members or business role when appropriate.
- Offline status.
- Unsynced count when useful.

Avoid displaying sensitive balances on the picker screen.

## Profile transition behavior

When a profile is selected:

1. Store the active profile/space ID locally.
2. Scope all new data requests to that profile.
3. Clear or namespace the previous profile's in-memory queries.
4. Load cached data immediately.
5. Recalculate navigation modules.
6. Load profile-specific categories, rules, currency, tax context, and default
   account.
7. Animate into the selected dashboard.
8. Start background synchronization.

Unsent mutations remain attached to their original profile and must not move when
the user switches profiles.

## Profile-specific navigation

### Personal

- Home.
- Transactions.
- Accounts.
- Budgets and goals.
- Categories.
- Reconciliation.
- Settings.

### Family

- Family overview.
- Shared Expenses.
- Shared transactions.
- Shared accounts.
- Shared budgets and goals.
- Family members and settings.

### Business

- Business cash flow.
- Transactions.
- Accounts.
- Invoices.
- Suppliers/payees.
- Reports and exports.
- Reconciliation.
- Business settings and members.

The app shell remains shared, but navigation is calculated from the active
profile's modules, membership role, and subscription entitlements.

## Animation and accessibility

- Use a short transition after the user selects a profile.
- Do not delay direct single-profile startup for decorative animation.
- Respect reduced-motion settings.
- Ensure profile cards have accessible labels and role descriptions.
- Make the current profile visible after navigation completes.
- Provide a direct profile-switch action that does not require gestures.

## V1 acceptance criteria

V1 is ready when:

1. A new user reaches Personal without unnecessary profile-selection friction.
2. A user with Personal and Business can switch without data leakage.
3. A family can access Family while keeping Personal data private.
4. Shared Expenses exists inside Family and does not duplicate the ledger.
5. Kip displays the active profile before saving.
6. Offline mutations preserve their original profile.
7. The last active profile resumes safely after app restart.
8. Profile changes update categories, rules, currency, tax context, and modules.
9. Light/dark styling and typography are controlled through the global theme
   index.
10. The same flows are usable with VoiceOver, TalkBack, large text, and reduced
    motion.
