# Financial Profiles, Subscriptions, Personal, Family, and Business Plan

## Purpose

Define how one user can have a Personal profile, a shared Family profile,
and one or more Business profiles without creating separate applications,
separate logins, or mixed financial data.

This is a product and architecture plan only. It does not add application code.

## Recommended model

Use one Logg account with multiple isolated financial spaces. In the user
interface, call these **profiles** or simply show their names as **Personal**,
**Family**, and **Business**. The backend can continue using a workspace-like
data boundary internally.

The concepts should remain separate:

| Concept | Meaning |
| --- | --- |
| User account | The person who logs in to Logg |
| Financial profile/space | One independent financial ledger and data boundary |
| Workspace (internal) | Backend representation of a profile/space |
| Space member | A user who has access to a shared space |
| Space role | Owner, manager, editor, or viewer permissions |
| Subscription | The commercial plan being paid for |
| Entitlement | The features, limits, and seats granted by a subscription |
| Module | A product capability enabled for a workspace |

The existing repository already has most of the foundation for this approach:

- `WorkspaceKind` has `personal` and `business`.
- Workspaces have `enabled_modules`.
- Workspaces have roles and members.
- Workspaces have currency, locale, timezone, and tax jurisdiction.

The Family profile should be represented explicitly in the long-term model.
Do not overload the Personal profile to mean both private personal finances and
shared family finances. During implementation, decide whether to add a `family`
kind or introduce a more general space-purpose field.

Subscriptions and entitlements will need a future billing design because the
current repository has products and invoice billing concepts, but not yet a
complete user-plan entitlement system.

## Approved V1 profile model

### Personal profile

Every new user receives a Personal profile by default. The app asks only a few
optional onboarding questions and can seed categories from a template such as
Student, Employee, Family, or Freelancer.

The Personal profile is private by default. It contains:

- Personal income and expenses.
- Personal accounts.
- Personal categories and rules.
- Budgets and goals.
- Personal bank connections.

### Family profile

A Family plan creates or enables a shared Family profile. Family members keep
their own Personal profiles and are invited to the Family profile.

The Family profile contains:

- Shared bank accounts.
- Shared transactions.
- Shared categories.
- Shared budgets and goals.
- Shared expense splitting.
- Family reconciliation.

The user-facing Shared Expenses page belongs inside the Family profile. It
should not become a separate ledger that duplicates accounts, categories, and
transactions.

### Business profile

A Business plan creates or enables a separate Business profile. It contains:

- Business accounts.
- Business transactions.
- Invoices and products.
- Suppliers/payees.
- VAT/MWST settings.
- Business reports and exports.
- Business members and roles.

Personal, Family, and Business profiles never share balances by default.

## Example user setup

One person may have:

### Personal profile

Used for:

- Personal income and expenses.
- Family finances.
- Personal accounts.
- Budgets and goals.

### Business profile

Used for:

- Business bank accounts.
- Business expenses.
- Invoices.
- Suppliers and payees.
- VAT/MWST data.
- Business reports.

The same user logs in once and switches between profiles. The app never combines
the Personal, Family, and Business ledgers by default.

## Family plan

A Family plan should normally provide private Personal profiles plus one shared
Family profile with the plan's allowed members.

Example:

- User A has a private Personal profile.
- User B has a private Personal profile.
- User A creates or activates a Family profile.
- Family members are invited to the Family profile.
- Members see Family transactions according to their roles.
- The plan grants the required Family seats.
- Members can use Kip inside the Family profile.

Members' private Personal profiles are never automatically merged into the
Family profile. If family members want to share only selected accounts or
expenses, those records are created in the Family profile explicitly.

## Business plan

A business plan should grant access to a Business profile and its modules.

Business entitlements may include:

- Number of Business profiles.
- Number of members/seats.
- Bank connections.
- Invoice module.
- Reports and exports.
- Attachments/storage.
- Advanced reconciliation.
- Business tax packs.
- Automation/rules.

The Business profile should have its own:

- Currency.
- Locale.
- Timezone.
- Tax jurisdiction.
- Accounts.
- Categories.
- Payees.
- Rules.
- Transaction history.
- Subscription/module state.

## Can personal and business subscriptions exist together?

Yes.

The recommended arrangement is:

- One user account.
- One personal or family subscription.
- One or more business subscriptions or business entitlements.
- Separate profiles receiving those entitlements.

The user should see subscription status in settings, but the main application
should focus on the active profile rather than constantly showing billing
information.

## Subscription ownership recommendation

Use a billing owner/customer concept separate from the workspace member model.

### Personal/family subscription

- Usually owned by one person.
- Grants one Personal profile.
- Grants one or more personal seats.
- May allow Family sharing.

### Business subscription

- Owned by the business billing owner or the person paying for the business.
- Grants one or more Business profiles.
- Grants a seat limit and business modules.
- Can be transferred when an owner or manager changes.

The billing owner should not be assumed to be the only workspace owner. A
business can have an accounting manager or second owner according to workspace
roles.

## Mobile application behavior

### First login

1. User logs in.
2. App creates or loads the user's Personal profile.
3. App optionally asks whether the user wants to create a Family or Business
   profile.
4. App loads accessible profiles/spaces.
5. If there is one profile, open it directly without showing a switcher.
6. If there are multiple profiles, show a profile selection screen.
7. Remember the last active profile securely and locally.

The complete cold-start decision tree, including secure-session validation,
SQLite profile summaries, last-profile resume, and first-use picker behavior is
defined in `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`.

### Normal app use

The header should clearly show the active profile:

- Profile name, such as Personal, Family, or Business.
- Profile type.
- Profile icon/color.
- Current currency when useful.

Tapping the header opens the profile switcher.

The app should not create separate Personal and Business login flows. It should
create one application shell whose available destinations are calculated from
the active profile, its members, subscription entitlements, and server-provided
modules.

### Personal profile navigation

Show primarily:

- Home.
- Transactions.
- Accounts.
- Budgets.
- Goals.
- Categories.
- Reconciliation.
- Settings.

### Family profile navigation

Show primarily:

- Family overview.
- Shared expenses.
- Shared transactions.
- Shared accounts.
- Shared budgets and goals.
- Family members.
- Settings.

### Business profile navigation

Show primarily:

- Home/cash flow.
- Transactions.
- Accounts.
- Invoices.
- Payees/suppliers.
- Reports.
- Reconciliation.
- Tax/business settings.
- Members and permissions.

Shared features such as Kip, accounts, transactions, bank connections, and
reconciliation use the same code path but read the active profile context.

## Kip and profile context

Kip must always know which profile is active before saving a transaction.

The Kip window should display:

- Active profile: Personal, Family, or Business.
- Selected account.
- Currency.
- Optional category context.

Examples:

- Kip opened in a Personal profile uses personal categories and personal
  rules.
- Kip opened in a Family profile uses shared categories and shared expense
  rules.
- Kip opened in a Business profile uses business categories, business tax
  rules, and business currency.
- A pending offline Kip record stores the profile/space ID permanently with the
  outbox mutation.

If the user has multiple profiles and the selected account is ambiguous, Kip
must ask before saving. It must never guess the Business or Family profile
simply because it was used recently.

## Profile isolation in offline storage

Every local record must be scoped by:

- User ID.
- Profile/space ID, represented internally by the workspace ID.
- Account ID where applicable.
- Device ID/client ID for outbox operations.

When the user switches profiles:

1. Stop showing queries from the previous profile.
2. Keep unsent mutations tied to their original profile/space.
3. Load the selected profile snapshot.
4. Recalculate module navigation.
5. Recalculate Kip categories, rules, tax context, and default account.
6. Never merge balances from Personal, Family, and Business profiles in the
   default dashboard.

A future optional “all profiles overview” must be explicitly labeled and must
not replace the isolated profile dashboards.

## Entitlement and module behavior

The server should resolve the effective entitlements and return the allowed
profile modules. Mobile uses those values for navigation and usability, while
the backend enforces every read and write.

Example:

| Profile | Plan | Modules |
| --- | --- | --- |
| Personal | Personal | Transactions, accounts, budgets, goals |
| Family | Family | Transactions, accounts, shared expenses, budgets, goals, members |
| Café business | Business | Transactions, accounts, invoices, reports, tax, members |
| Freelancer business | Business | Transactions, accounts, invoices, exports |

Modules should not be determined solely by the mobile app version or by a
hard-coded user type. They must be resolved for the active profile.

## Subscription states

The app should represent at least:

- Active.
- Trial.
- Grace period.
- Payment problem.
- Cancelled but active until end date.
- Expired.
- Pending verification while offline.

### Offline subscription behavior

The app must not delete or hide existing financial data when it cannot verify a
subscription offline.

Recommended behavior:

- Use the last verified entitlement snapshot.
- Allow already-supported offline reads and safe local transaction capture.
- Mark new business mutations as pending if the entitlement cannot be verified.
- Let the backend approve or reject the mutation during synchronization.
- Show the user a clear status when a module needs plan renewal.

Financial data must remain accessible even if billing is expired.

## Upgrade and downgrade behavior

### Upgrade personal to family

- Keep the existing Personal profile and data.
- Add the Family profile.
- Add the required member-seat entitlement.
- Invite family members to the Family profile.
- Preserve all existing Personal categories, accounts, and transactions.

### Add business plan

- Create a new Business profile or enable Business profile creation.
- Do not copy Personal or Family data into the Business profile automatically.
- Offer explicit import/copy actions only when the user requests them.

### Downgrade business plan

- Keep data read-only if necessary.
- Preserve transaction history, invoices, and documents.
- Explain which future writes or modules are unavailable.
- Never silently delete records.

## Web and mobile consistency

The web and mobile clients must receive the same:

- Active profile/space metadata.
- Enabled modules.
- Roles.
- Entitlement state.
- Currency and tax context.

Creating a Business or Family profile on the web should make it available in
mobile after synchronization. Creating a transaction in mobile should remain
inside the selected profile when viewed on the web.

## Recommended implementation order

1. Create a Personal profile automatically for every new user.
2. Add low-question onboarding and persona-based category templates.
3. Implement mobile profile selection and switching.
4. Add the Family profile and invitation flow for Family plans.
5. Add the Shared Expenses feature inside Family.
6. Add the Business profile and business members/modules.
7. Scope SQLite and outbox records by internal space/workspace ID.
8. Add a server-resolved module/capability response.
9. Define subscription and entitlement data ownership.
10. Add billing screens and renewal states.
11. Add upgrade/downgrade migration behavior.
12. Add optional cross-profile overview only after isolation is proven.

## Product recommendation

Do not build separate “Personal Logg” and “Business Logg” apps. Build one Logg
app with:

- One login.
- One default Personal profile.
- Optional shared Family profile.
- Optional Business profile or profiles.
- Personal, family, and business entitlements.
- Profile-specific navigation.
- Shared Kip and transaction infrastructure.
- Explicit business modules.

This keeps the user experience simple while allowing one person to manage
private finances, shared family expenses, and one or more businesses safely.
