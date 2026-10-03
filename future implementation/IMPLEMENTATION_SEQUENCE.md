# Implementation Sequence and Approval Plan

## Purpose

Provide a dependency-ordered implementation plan that can be approved before
any application code is written.

For the complete V1 step-by-step scope, use `V1_BUILD_PLAN.md`. This sequence
provides the dependency roadmap; the V1 plan defines the required native design
quality, web feature treatment, and Kip coverage.

## Phase 0 — Review and decisions

### Deliverables

- Review all files in this directory.
- Confirm one shared Expo application strategy.
- Confirm one account with Personal, Family, and Business profiles backed by
  isolated financial spaces.
- Confirm personal/family and business subscription entitlement behavior.
- Confirm whether backend additive sync endpoints are allowed after the first
  mobile shell.
- Review typography candidates.
- Review light/dark palette candidates.
- Confirm first release scope: consumer only, business only, or both with
  progressive modules.
- Confirm V1 targets broad functional parity with the current web application,
  with native treatment for core workflows and a documented fallback only for
  low-frequency features.

### Exit criteria

- The user approves the architecture and design-system strategy.
- The user identifies required changes to the plans.
- No unresolved conflict remains between this directory and the historical
  mobile specification.

## Phase 1 — Contract and design-system foundation

### Plan

1. Inventory frontend API methods and backend routes.
2. Compare TypeScript and Pydantic contracts.
3. Define shared package boundaries.
4. Implement the global mobile theme index.
5. Confirm the V1 UI library and system-font decisions.
6. Add light/dark token tests and sample screens.

### Depends on

- Frontend integration plan.
- Backend mobile API plan.
- Design-system plan.

### Verification

- Existing web tests remain green.
- Shared contract tests cover auth, workspace, transaction, and reconciliation
  payloads.
- Design tokens render all required component variants.
- Contrast and touch-target checks pass.
- Apple HIG and Android Material 3 review criteria are documented for every V1
  screen.

## Phase 2 — Mobile shell and authentication

### Plan

1. Create the Expo app and typed navigation.
2. Add secure storage adapters.
3. Add login, registration, 2FA, logout, and session restoration.
4. Add profile selection, Personal/Family/Business context, and
   module-aware navigation.
5. Add system/light/dark theme selection.
6. Follow `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md` for cold start,
   SQLite profile summaries, last-profile resume, and profile picker behavior.
7. Follow `V1_BUILD_PLAN.md` for the complete current-web feature parity order.

Kip must show the active profile and account context before saving a
transaction.

### Verification

- iOS and Android development builds start.
- Normal login, failed login, 2FA, logout, and expired token flows work.
- No token or password is stored in plain local storage or logged.
- The native shell has a documented treatment for every current web route.

## Phase 3 — Core mobile frontend feature parity

### Plan

Follow `MOBILE_FRONTEND_FEATURE_PORTING_PLAN.md` and port the first vertical
slice:

1. Dashboard.
2. Accounts.
3. Transactions.
4. Categories and payees.
5. Kip entry.
6. Workspace/module-aware navigation.

Use the global design-system index for every screen. Do not copy web page
components or desktop layouts.

### Verification

- The same account data is visible on web and mobile.
- A transaction created on either client is visible on the other after sync.
- Personal and business workspace navigation differs only by server-enabled
  modules.
- The feature parity matrix identifies every deferred feature.

## Phase 4 — Local database and synchronization

### Plan

1. Review `mobile/SQLITE_SCHEMA.sql` against backend contracts.
2. Implement migrations and database versioning.
3. Implement repository reads from SQLite.
4. Implement outbox and retry behavior.
5. Implement cursor synchronization after backend approval.

### Verification

- App starts and displays cached data offline.
- New local mutations survive app termination.
- Replaying a mutation does not duplicate it.
- Conflict state is visible and recoverable.

## Phase 5 — Kip and transaction entry

### Plan

1. Follow `KIP_LOCAL_AI_AND_DELAYED_RECONCILIATION_PLAN.md`.
2. Implement the deterministic parser described in `mobile/KipOfflineEngine.ts`.
3. Add manual entry form with locale-aware amount/date/category behavior.
4. Add pending-settlement display and optimistic balance treatment.
5. Add transaction detail/edit flow.
6. Add a local model adapter only after deterministic parsing and validation are
   proven on supported devices.

Receipts, Austrian QR verification, voice, and digital invoices are not part of
this first Kip slice. They begin only after the typed text flow, offline queue,
and delayed bank reconciliation are reliable.

### Verification

- Kip works without network.
- Invalid input is rejected with an actionable error.
- EUR/CHF and DACH date formats round-trip correctly.
- Pending and settled records are not duplicated.
- Local AI is optional and prompts remain on-device by default.

## Phase 6 — Bank connections and reconciliation

### Plan

1. Add validated OAuth/deep-link flow.
2. Add bank connection status and sync history.
3. Add reconciliation candidate queue.
4. Add auto-merge, confirm, ignore, and manual-only decisions.
5. Preserve existing transfer, invoice, recurring, split, and categorization
   rules.
6. Preserve the manual entry as provenance while materializing one canonical
   bank-linked transaction.

### Verification

- Provider credentials stay server-side.
- Callback state is validated and single-use.
- Ambiguous candidates require explicit user decisions.
- Existing reconciliation behavior remains compatible with web.
- A manual-plus-bank match changes the balance exactly once.

## Phase 7 — Product modules

### Plan

Implement modules in this order:

1. Accounts and transactions.
2. Categories and rules.
3. Budgets and goals.
4. Recurring transactions.
5. Reports.
6. Invoices and business workflows.
7. Physical receipt capture and on-device OCR.
8. Digital invoice import and document extraction.
9. Groups, assets, and advanced modules.

Each module must be enabled by workspace capabilities and must not leak
business-only navigation into personal workspaces.

Receipt and invoice work must use the document archive, retention, and
jurisdiction review described in `KIP_LOCAL_AI_AND_DELAYED_RECONCILIATION_PLAN.md`.

## Phase 8 — Platform hardening and release

### Plan

- APNs and FCM registration.
- Background sync constraints.
- Deep links and universal/app links.
- Biometric unlock.
- Camera/document permissions.
- iOS and Android store compliance.
- Crash/error redaction.
- Accessibility and device matrix.
- Performance and battery review.

## Definition of implementation readiness

Implementation may start after approval confirms:

- Architecture.
- API boundary.
- Offline sync direction.
- Design-system global index location.
- Typography strategy.
- Light/dark palette strategy.
- First-release scope.
- Required backend additions.
