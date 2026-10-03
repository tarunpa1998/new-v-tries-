# Mobile Frontend Feature-Porting Plan

## Purpose

Explain how the existing web application's frontend features can be brought to
the future iOS and Android application.

The answer is yes: Logg can provide the existing product functionality on
mobile. The implementation should port the **feature behavior, API contracts,
permissions, validation, and business rules** while rebuilding the presentation
with native mobile navigation and controls.

This is a planning document only. It does not add mobile application code.

## Core principle

Do not copy a web page into React Native.

Port each feature through these layers:

1. Existing backend API and permission contract.
2. Shared TypeScript domain types.
3. Shared pure business helpers and validation.
4. Mobile data repository and offline behavior.
5. Native iOS/Android screen flow.
6. Platform-specific interaction details.
7. Feature-level tests on both platforms.

The backend remains the source of truth. The web and mobile applications become
two clients of the same product capabilities.

## Profile context for the mobile frontend

The mobile app should present one login with isolated financial profiles:

- **Personal** — created by default for every user.
- **Family** — shared by family members and used for shared expenses.
- **Business** — used for business accounts, invoices, tax settings, and
  business members.

These can be backed by workspace-like records internally, but the user should
not need to understand the backend term “workspace.” A profile switcher appears
only when the user has more than one accessible profile.

Every ported feature must declare its profile availability:

| Feature | Personal | Family | Business |
| --- | --- | --- | --- |
| Kip | Yes | Yes | Yes |
| Accounts and transactions | Yes | Yes | Yes |
| Shared expenses | No | Yes | Optional later |
| Budgets and goals | Yes | Yes | Optional |
| Invoices | No by default | No by default | Yes |
| VAT/MWST settings | No by default | No by default | Yes |
| Members and roles | Optional | Yes | Yes |

The active profile must be included in API context, SQLite records, outbox
mutations, navigation decisions, category loading, and Kip confirmation.

## V1 parity policy

V1 targets broad functional parity with the current web application. The mobile
screen does not need to resemble the web screen, but the user should be able to
complete the same important task.

Every current route must receive a treatment classification:

1. Native mobile screen.
2. Native mobile adaptation.
3. Public deep-link screen.
4. Temporary authenticated web fallback for low-frequency functionality.
5. Later phase with a documented reason and owner.

Core finance, profile, bank, reconciliation, Family, Business, and Kip flows
must be native. A generic WebView must not be the primary V1 experience. A
temporary authenticated fallback is allowed only for low-frequency features if
it does not expose data to an untrusted page and does not delay core financial
workflows.

## What can be shared and what must be rebuilt

| Existing web asset | Mobile treatment |
| --- | --- |
| API endpoint methods | Extract into shared API package |
| Request/response types | Share after backend contract review |
| Zod validation schemas | Share when they are platform-neutral |
| Date/currency/category helpers | Share after removing browser dependencies |
| Reconciliation and rule concepts | Share domain behavior; native UI is rebuilt |
| Translation JSON files | Share resources and keys |
| React Query concepts | Reuse query strategy; add SQLite repository layer |
| React pages | Rebuild as native screens |
| React DOM components | Rebuild as native components |
| Tailwind/shadcn/Radix components | Do not import into mobile |
| Browser localStorage | Replace with secure storage and SQLite |
| Browser routing | Map to Expo Router/native navigation |
| Desktop tables and command palette | Adapt to mobile lists, filters, search, and sheets |
| Browser PDF/file APIs | Replace with native document/share APIs |

## Existing web feature inventory

The current route inventory is in `frontend/src/App.tsx` and the corresponding
pages are in `frontend/src/pages/`.

### Authentication and setup

Web pages/components:

- `/setup`
- `/login`
- `/register`
- `/auth/oidc/callback`
- Two-factor setup and verification components.
- Passkey-related backend and web flows.

Mobile treatment:

- Native welcome/setup flow.
- Password login.
- Registration.
- 2FA challenge.
- Secure session restoration.
- Native deep-link callback handling for OIDC/provider flows.
- Biometric unlock for an existing secure session.

### Core personal-finance features

- Dashboard: `/`.
- Transactions: `/transactions`.
- Accounts: `/accounts` and `/accounts/:id`.
- Categories: `/categories`.
- Budgets: `/budgets`.
- Goals: `/goals`.
- Recurring transactions: `/recurring`.
- Reports: `/reports`.
- Payees: `/payees`.
- Rules: `/rules`.
- Collections: `/collections`.
- Groups and split groups: `/groups` and `/groups/:id`.

These are the highest-value mobile features because they support daily use by
personal users and small businesses.

### Bank and transaction workflows

- Bank connection dialog and provider selection.
- Connection settings.
- OAuth callback handling.
- Enable Banking callback route.
- CSV/import flow: `/import`.
- Transaction attachments.
- Transfers.
- Transaction splits.
- Transaction drill-down.
- Calendar/list view switching.

Mobile treatment:

- Bank authorization opens in the system browser and returns through a
  validated deep link.
- Imports use the native document picker and a guided preview flow.
- Transaction details use a native sheet or detail screen.
- Dense web grids become searchable, filterable mobile lists.
- Calendar and list views remain separate native modes.
- Attachments use camera/document/photo-picker capabilities later in the plan.

### Business features

- Invoices: `/invoices`.
- Invoice detail: `/invoices/:id`.
- Invoice schedules: `/invoices/schedules`.
- Invoice schedule detail: `/invoices/schedules/:id`.
- Invoice products: `/invoices/products`.
- Payees and tax identifiers.
- Reports and exports.

Mobile treatment:

- Invoice list and detail should be mobile features when the business module is
  enabled.
- Invoice creation should use a step-based mobile form rather than the desktop
  multi-column form.
- Invoice schedules need a compact schedule summary and a separate detail
  screen.
- Generated invoice documents should support preview, download, and native
  sharing.
- Product catalogs can begin as search/select experiences and gain advanced
  editing later.

### Advanced and operational features

- Assets and investments: `/assets`.
- Asset import through the investment import tab.
- Agents: `/agents`, `/agents/:id`, and `/agents/connections`.
- Workspace settings: `/workspace/settings`.
- Admin settings: `/admin`.
- Shared invoice link: `/i/:token`.
- Update notifications and desktop command palette.

Mobile treatment:

- Workspace settings are important and should be ported early enough to
  support currency, locale, tax jurisdiction, members, and modules.
- Admin settings should be limited to authorized users and may initially be
  desktop-first if they involve operational tables.
- Shared invoice links should be supported through universal/app links and a
  public read-only mobile screen.
- Assets and investments should be ported after core transactions unless users
  identify them as first-release requirements.
- Agents should be evaluated separately because chat, tool connections, and
  long-running responses need a mobile-specific experience.
- The command palette should become native search and feature shortcuts, not a
  literal port.

## Feature parity levels

Every feature should receive an explicit parity level rather than an unclear
"mobile support" label.

### Level 1 — Read-only parity

Mobile can view the feature's data, status, and history.

Examples:

- Reports.
- Asset summaries.
- Invoice documents.

### Level 2 — Core actions parity

Mobile can perform the normal daily actions.

Examples:

- Add/edit transactions.
- Categorize transactions.
- Confirm reconciliation candidates.
- Create and edit budgets.
- Create invoices.

### Level 3 — Advanced parity

Mobile supports configuration and less-frequent advanced workflows.

Examples:

- Rule authoring and ordering.
- Complex invoice schedules.
- Split-group management.
- Asset imports.
- Advanced exports.

### Level 4 — Platform-enhanced parity

Mobile adds capabilities that are better than the web version on a phone.

Examples:

- Offline Kip entry.
- Camera receipt capture.
- Biometric unlock.
- Push notifications for failed sync.
- Native share sheet.

## Recommended porting order

### Slice 1 — Usable personal account

Port:

1. Login, registration, 2FA, logout.
2. Workspace selection.
3. Dashboard.
4. Accounts and account detail.
5. Transactions and transaction detail.
6. Categories and payees.
7. Kip quick entry.

The first slice creates only the Personal profile by default. Family and
Business profiles are added through explicit actions rather than appearing as
empty sections for every user.

Outcome: a user can open the app, see their finances, add a transaction, and
review it without needing the web app.

### Slice 2 — Bank-connected daily workflow

Port:

1. Bank connection list.
2. Native OAuth/deep-link completion.
3. Sync status and last-sync information.
4. Pending and posted transaction views.
5. Reconciliation candidate queue.
6. Confirm, ignore, or manually resolve candidates.
7. Background/offline recovery.

Outcome: a user can connect a bank and resolve daily financial questions on
mobile.

### Slice 3 — Personal planning

Port:

1. Budgets.
2. Goals.
3. Recurring transactions.
4. Rules and category automation.
5. Reports.
6. Collections and group splits.

Outcome: the personal finance experience reaches useful feature parity.

### Slice 4 — Small-business operations

Port:

1. Business workspace setup.
2. Business accounts and cash flow.
3. Payees and supplier data.
4. Invoices and products.
5. Invoice schedules.
6. Tax/VAT/MWST settings.
7. Attachments and document sharing.
8. Business reports and exports.

Outcome: small businesses can complete common daily operations without relying
on the web for every action.

### Slice 4A — Family experience

The Family slice can be delivered before or alongside business modules:

1. Invite family members to a Family profile.
2. Keep each member's Personal profile private.
3. Add shared accounts and shared transactions.
4. Add Shared Expenses inside the Family profile.
5. Show who paid, each person's share, and settlement state.
6. Keep Family Kip categories and accounts separate from Personal Kip.

Do not implement Shared Expenses as a second independent ledger. It should be a
feature inside the Family profile.

### Slice 5 — Advanced parity

Port or provide an approved V1 treatment for:

- Assets and investments.
- Advanced imports.
- Agents and agent connections.
- Administrative controls.
- Complex report configuration.
- Complete workspace management.

The V1 target is broad functional coverage. Low-frequency areas may initially
use a clearly labeled authenticated fallback, but they must remain in the parity
matrix until a native replacement is delivered.

## Mobile feature implementation process

For every ported feature, use the following sequence.

### Step 1 — Contract review

Identify:

- Backend routes.
- Request and response types.
- Workspace/module gates.
- User roles that can read or write.
- Existing web query and mutation behavior.
- Existing tests and edge cases.

### Step 2 — Shared logic classification

Decide which parts are:

- Shared pure logic.
- Backend-only logic.
- Web-only UI behavior.
- Mobile-only offline behavior.
- Platform-specific behavior.

### Step 3 — Mobile data model

Decide whether the feature is:

- Server-read-only.
- Locally cached.
- Offline creatable.
- Offline editable.
- Outbox-synchronized.
- Conflict-prone and requiring user resolution.

### Step 4 — Native information architecture

Replace desktop concepts intentionally:

- Desktop table → mobile list with search, filters, sort, and detail screen.
- Multi-column form → step-based form or bottom sheets.
- Right-side panel → navigation screen or sheet.
- Command palette → native search and shortcuts.
- Hover action → visible action, swipe action, or accessible menu.
- Desktop modal → platform sheet/dialog.

### Step 5 — Build with the global design system

Use the planned global theme index for:

- Colors.
- Typography.
- Spacing.
- Form dimensions.
- Status styles.
- Loading/error/empty states.
- iOS/Android platform adjustments.

No feature should introduce its own unrelated palette or typography.

### Step 6 — Permissions and module behavior

The screen must respect:

- Workspace kind.
- Enabled modules.
- Workspace role.
- Backend authorization response.
- Read-only versus writable state.

### Step 7 — Validate online and offline

Test:

- Initial online load.
- Cached offline load.
- Create/edit while offline where supported.
- Network recovery.
- Token expiry.
- Workspace switching.
- Duplicate submission.
- App termination during a mutation.
- Large text and dark mode.

## Navigation mapping

The web URL should not dictate the mobile navigation hierarchy.

| Web route family | Mobile destination |
| --- | --- |
| `/` | Home tab for the active profile |
| `/transactions` | Transactions tab |
| `/accounts` | Accounts tab |
| `/accounts/:id` | Account detail screen |
| `/categories`, `/payees` | More → Organization |
| `/budgets`, `/goals` | More → Planning |
| `/recurring`, `/rules` | More → Automation |
| `/reports` | More → Reports |
| `/groups` | More → Groups |
| `/invoices` | Business profile → Invoices |
| `/workspace/settings` | Active profile settings |
| `/oauth/callback` | Deep-link handler, not a visible tab |
| `/i/:token` | Public shared-invoice deep-link screen |
| `/admin` | Authorized settings area |
| `/agents` | Separate advanced area after core parity |

Navigation visibility must be generated from active-profile modules and role
data, not maintained as a separate hard-coded list that can drift from the
backend.

## Testing strategy for feature parity

### Shared logic tests

Run once against platform-neutral packages:

- Amount/date formatting.
- Category and rule behavior.
- Workspace module decisions.
- Reconciliation display calculations.
- Request/response transformations.

### Mobile feature tests

Test each feature's:

- Screen states.
- Permission states.
- Loading/skeleton state.
- Empty state.
- Error/retry state.
- Offline state.
- Optimistic mutation.
- Conflict state.
- Accessibility labels and focus/reading order.

### End-to-end parity tests

Use the same backend test account to verify:

1. Create on web, see on mobile.
2. Create on mobile, see on web.
3. Edit on one client, sync to the other.
4. Switch profiles and confirm data isolation.
5. Use Personal, Family, and Business module combinations.
6. Resolve a reconciliation candidate from either client.

## Feature-parity definition of done

A feature is considered ported when:

- Its backend contract is documented.
- Its web behavior remains unchanged.
- Its mobile navigation location is defined.
- Its role/module rules are enforced.
- Its data freshness/offline behavior is documented.
- Its native UI is implemented using global tokens.
- Its light/dark and accessibility states are tested.
- Its core iOS and Android flows pass on real or representative devices.
- Any intentionally deferred advanced behavior is visible in the parity matrix.

## Important conclusion

We can add all existing web features to iOS and Android over time. The correct
strategy is not to duplicate the web app twice. It is to build one native mobile
frontend that consumes the same backend, shares platform-neutral logic, and
adapts every feature to mobile workflows. Feature parity should be delivered in
vertical slices so the first release is useful while later business and
advanced features remain compatible with the same architecture.
