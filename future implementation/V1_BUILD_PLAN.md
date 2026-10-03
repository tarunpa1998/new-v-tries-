# V1 Build Plan — Native iOS/Android Frontend, Web Feature Parity, and Kip

## Purpose

Define the complete step-by-step build order for V1 of the Logg mobile app.

V1 should be a real mobile client of the existing Logg product, not a visual
demo. It should provide the current web application's important functionality
on iOS and Android wherever practical, while presenting it through native
mobile information architecture and interaction patterns.

Kip is part of V1. Kip must provide typed English/German transaction capture,
offline storage, later synchronization, and delayed bank reconciliation.

This is a planning document only. It does not add application code.

## V1 product goal

At the end of V1:

1. A user can log in on iOS or Android.
2. A new user receives a Personal profile with minimal onboarding.
3. Family members can use a shared Family profile.
4. Business users can switch to a Business profile.
5. The user can access the existing financial data from the web application.
6. Core web workflows are available through native mobile screens.
7. Less frequent web functionality is still accessible through an approved
   native adaptation or temporary authenticated fallback.
8. Kip can create income and expense drafts offline.
9. Offline transactions synchronize later without duplicates.
10. A delayed bank transaction is linked to a manual Kip transaction without
    double-counting the balance.
11. The app looks intentionally designed for iOS and Android rather than like a
    compressed desktop web page.

## Design authority and Apple skill status

The repository does not currently contain a dedicated Apple/iOS design skill.
The existing frontend, mobile, and UI/UX guidance remains useful, but native
implementation should additionally follow:

- Official Apple Human Interface Guidelines for iOS behavior.
- Official Android Material 3 guidance for Android behavior.
- Platform accessibility guidance for VoiceOver and TalkBack.

These references are design authorities, not code libraries. The implementation
should not install an unverified third-party “Apple design skill” just to copy
visual patterns. If a verified skill is supplied later, it can be reviewed
against this plan before adoption.

## Anti-vibe-coded quality standard

The app must look like a designed financial product, not a generated collection
of screens.

Every screen must have:

- A clear content hierarchy.
- A deliberate primary action.
- Consistent spacing from the global theme index.
- A clear loading, empty, error, and offline state.
- Consistent iconography.
- Intentional typography roles.
- Profile context where financial data is shown.
- Accessible labels and touch targets.
- A platform-appropriate navigation pattern.

Avoid:

- Random gradients or decorative glass cards.
- Excessive rounded cards around every field.
- Mixed icon families.
- Random font sizes and colors.
- Desktop tables squeezed into a phone width.
- Generic “AI-looking” chat screens without financial context.
- Repeated floating buttons competing for attention.
- Web-style dialogs where a native sheet or navigation screen is expected.
- Placeholder screens that are presented as finished features.

## V1 step-by-step implementation sequence

### Step 0 — Freeze the V1 scope and contracts

Review and approve:

- One Expo/React Native app for both platforms.
- Personal, Family, and Business profile model.
- Current web API and backend as the system of record.
- Native mobile UI instead of a generic WebView wrapper.
- V1 UI library and typography choices.
- Kip local model and offline behavior.
- Web feature parity matrix.

Create a route/feature inventory from:

- `frontend/src/App.tsx`
- `frontend/src/pages/`
- `frontend/src/components/`
- `frontend/src/lib/api.ts`
- `frontend/src/types/index.ts`
- `backend/app/api/`

For every current web route, classify the V1 mobile treatment as:

1. Native mobile screen.
2. Native mobile adaptation.
3. Public deep-link screen.
4. Authenticated temporary web fallback.
5. Later phase with an explicit reason.

No existing feature should disappear without a documented classification.

### Step 1 — Validate the native build foundation

Select and pin compatible versions for:

- Expo.
- React Native.
- Expo Router.
- iOS deployment target.
- Android API target.
- SQLite binding.
- Reanimated and Gesture Handler.
- Secure storage.
- Native Kip runtime spike.

Build an empty development application on:

- One representative iPhone.
- One representative Android phone.
- One larger iOS device or iPad layout.
- One larger Android/tablet layout.

Do not begin feature porting until both development builds start reliably.

### Step 2 — Build the global design system before full screens

Create the planned global theme index:

- `apps/mobile/src/theme/index.ts`

Define:

- Light mode tokens.
- Dark mode tokens.
- System theme mode.
- SF Pro/system typography roles for iOS.
- Roboto/system typography roles for Android.
- Spacing, radii, borders, elevation, and motion.
- Touch targets.
- Component variants.
- Financial status roles.
- iOS adapters.
- Android adapters.

Build a design review set before implementing full features:

- Login.
- Personal dashboard.
- Family dashboard.
- Business dashboard.
- Transaction list.
- Kip sheet.
- Reconciliation candidate.
- Empty state.
- Error state.
- Offline state.

Review these in light/dark mode and on both platforms. Do not proceed with a
screen library until the visual language is consistent.

### Step 3 — Build the mobile shell and cold start

Implement the shell in this order:

1. Native splash.
2. Secure session loading.
3. Login and registration routes.
4. 2FA route.
5. Logout and token-expiry handling.
6. SQLite profile-summary loading.
7. Personal/Family/Business profile switching.
8. Last-active-profile resume.
9. Profile picker for first use or explicit switching.
10. Profile-specific navigation.

Cold start must behave as defined in:

- `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`

The user-facing picker should say “Choose your profile” or “Where are you
managing money?” It should not ask “Who is logging today?” because the account
identity is already known.

### Step 4 — Extract shared frontend contracts

Create the shared boundaries without importing web UI:

- API transport and endpoint contracts.
- TypeScript domain types.
- Platform-neutral validation.
- Currency/date/category helpers.
- Workspace/profile module decisions.
- Localization resources.
- Design tokens.

The web application should adopt shared contracts incrementally so parity can be
tested between web and mobile.

### Step 5 — Implement local data and synchronization

Implement:

1. SQLite migrations.
2. Profile-scoped repositories.
3. Cached profile summaries.
4. Cached accounts and transactions.
5. Outbox mutations.
6. Retry and reconnect behavior.
7. Sync cursor handling.
8. Idempotent client IDs.
9. Conflict state.
10. Background synchronization.

Every local row and outbox item must retain its original profile/space ID.
Switching profiles must never move unsent mutations.

### Step 6 — Port authentication, profiles, and settings

Native screens:

- Login.
- Registration.
- 2FA.
- Session restoration.
- Personal onboarding.
- Persona-based category template selection.
- Profile picker.
- Profile creation.
- Family invitation acceptance.
- Business profile creation.
- Profile settings.
- Currency, locale, timezone, and tax settings.
- Members and roles.

Personal onboarding should ask as few questions as possible. Categories should
be seeded from templates and remain editable.

### Step 7 — Port core web functionality

Build native mobile versions of:

- Dashboard.
- Accounts.
- Account detail.
- Transactions.
- Transaction detail.
- Categories.
- Payees.
- Transaction editing.
- Transfers.
- Transaction splits.
- Attachments where the native document flow is ready.

Web tables should become mobile lists with:

- Search.
- Filters.
- Sort.
- Pagination or virtualized scrolling.
- Detail screens.
- Bottom-sheet actions.

### Step 8 — Port bank connectivity and reconciliation

Build:

- Bank connection list.
- Provider selection.
- Native browser authorization.
- Validated deep-link callback.
- Connection settings.
- Sync status.
- Pending/posted transaction views.
- Reconciliation candidate queue.
- Confirm, decline, keep-separate, and manual-only actions.
- Reconciliation history.

The backend remains responsible for provider credentials and canonical bank
data.

### Step 9 — Introduce Kip in V1

Kip is introduced after the profile context, core transaction flow, SQLite
storage, and outbox are stable.

V1 Kip includes:

- Right-hand thumb-friendly floating action.
- Native iOS sheet.
- Android Material-style bottom sheet.
- Active profile, account, and currency display.
- Typed English prompts.
- Typed German prompts.
- Deterministic amount/date/direction parsing.
- Local category aliases and user corrections.
- Qwen2.5-1.5B benchmark candidate.
- Qwen2.5-0.5B lower-memory fallback candidate.
- Strict structured-output validation.
- User confirmation.
- SQLite pending-settlement record.
- Offline outbox synchronization.
- Delayed bank reconciliation.

Voice, receipt OCR, RKSV verification, and digital invoice extraction remain
separate later intake phases and must not destabilize text Kip.

### Step 10 — Port personal planning features

Add native versions of:

- Budgets.
- Goals.
- Recurring transactions.
- Rules.
- Reports.
- Collections.
- Groups and shared splits.

These features must read the active profile and respect Personal, Family,
and Business modules.

### Step 11 — Port Family functionality

Build:

- Family profile setup.
- Second-member invitation.
- Shared accounts.
- Shared transactions.
- Shared categories.
- Shared budgets and goals.
- Shared Expenses.
- Who-paid tracking.
- Split shares.
- Settlement state.

Family data must remain separate from each member's private Personal profile.

### Step 12 — Port Business functionality

Build native business screens for:

- Business dashboard/cash flow.
- Business accounts.
- Business transactions.
- Invoices.
- Invoice detail.
- Invoice schedules.
- Products.
- Suppliers/payees.
- VAT/MWST settings.
- Business reports.
- Exports.
- Members and permissions.
- Attachments and document sharing.

Business forms should be step-based rather than copied from desktop
multi-column layouts.

### Step 13 — Cover remaining web functionality

Target functional V1 coverage for the remaining current web routes:

- CSV/import workflows.
- Assets and investments.
- Shared invoice links.
- Administrative settings.
- Agent list/detail/connections.
- Advanced exports.
- Advanced attachments.
- Less common configuration screens.

Preferred treatment is native mobile adaptation. If a low-frequency feature
cannot be implemented natively without delaying core financial functionality,
use a temporary authenticated web fallback only when:

- The user is already authenticated.
- The fallback is clearly labeled.
- Sensitive data is not exposed to an untrusted external page.
- The user can return to the native app safely.
- The feature remains on the parity matrix for eventual native replacement.

A generic WebView wrapper must not become the primary V1 experience.

### Step 14 — Native design and quality review

For every V1 screen, review:

#### iOS

- Navigation stack behavior.
- Tab bar usage.
- Large and compact navigation titles.
- Grouped/inset settings and financial lists.
- Sheet detents.
- Back navigation.
- Native date, time, currency, and confirmation controls.
- Toolbar placement and contextual menus.
- SF Symbols or an intentional iOS vector fallback.
- Subtle materials, separators, and elevation instead of decorative card piles.
- Meaningful haptics only for confirmation and important state changes.
- Dynamic Type.
- VoiceOver labels.
- Safe-area layout.
- Swipe actions with visible alternatives.
- iPhone small-screen, large-screen, and iPad layouts.

#### Android

- Material 3 hierarchy.
- System/predictive back.
- Bottom navigation.
- Bottom sheets.
- Ripple and pressed states.
- TalkBack labels.
- Font scaling.
- Edge-to-edge insets.

#### Both platforms

- 44pt/48dp touch targets.
- Light/dark contrast.
- Offline states.
- Empty/error/retry states.
- Reduced motion.
- Profile context.
- No raw styling outside the theme system.

### Step 15 — Web/mobile parity verification

Use the same backend test data to prove:

1. Web-created records appear on mobile.
2. Mobile-created records appear on web.
3. Profile switching isolates data.
4. Personal, Family, and Business modules behave correctly.
5. Kip-created offline transactions synchronize.
6. Delayed bank transactions do not duplicate balances.
7. Existing web behavior remains unchanged.
8. Every current web route has a V1 treatment classification.

### Step 16 — Release readiness

Before calling V1 complete:

- iOS development/release build passes.
- Android development/release build passes.
- Core web feature parity passes.
- Kip offline and delayed reconciliation passes.
- Accessibility review passes.
- Light/dark design review passes.
- Profile isolation passes.
- Offline recovery passes.
- Deep-link flows pass.
- Error and financial-data logging review passes.
- Performance and battery review passes.
- Store metadata and permission explanations are ready.

## V1 feature coverage policy

V1 targets broad functional parity with the current web application. “Parity”
does not require identical layouts. It requires that users can complete the
same important task on mobile.

The priority is:

1. Native mobile experience for core financial workflows.
2. Native adaptations for business and family workflows.
3. Native or temporary authenticated fallback for low-frequency features.
4. No undocumented missing routes.
