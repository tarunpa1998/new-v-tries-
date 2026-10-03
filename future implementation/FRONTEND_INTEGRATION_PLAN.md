# Frontend Integration Plan

## Purpose

Define how the existing React/Vite frontend can share contracts and pure
business logic with a future iOS and Android application without attempting to
reuse browser-only UI code inside React Native.

This is a plan only. It does not change `frontend/`.

## Current frontend inventory

### API boundary

The main client is:

- `frontend/src/lib/api.ts`

It currently combines several responsibilities:

1. Axios configuration with `/api` as the base URL.
2. Browser `localStorage` access for the token.
3. Browser `localStorage` access for the active workspace.
4. Browser redirect behavior on HTTP 401.
5. Auth, workspace, account, transaction, bank connection, reconciliation,
   invoice, report, budget, goal, asset, and attachment methods.
6. Type imports from `frontend/src/types/index.ts`.

The mobile client must reuse the endpoint knowledge and response contracts while
replacing browser-specific storage and redirect behavior with native adapters.

### Domain types

The main type registry is:

- `frontend/src/types/index.ts`

It contains the current workspace, user, account, transaction, invoice,
reconciliation, provider, budget, goal, asset, and reporting types. The plan is
to make these contracts available to both web and mobile through a shared API
package after their relationship to the backend Pydantic schemas has been
checked.

### Pure utilities suitable for extraction

Candidate files include:

- `frontend/src/lib/account-utils.ts`
- `frontend/src/lib/category-reference-utils.ts`
- `frontend/src/lib/category-selection-utils.ts`
- `frontend/src/lib/date-utils.ts`
- `frontend/src/lib/format.ts`
- `frontend/src/lib/installment-series.ts`
- `frontend/src/lib/installment-utils.ts`
- `frontend/src/lib/modules.ts`
- `frontend/src/lib/rule-conditions.ts`
- `frontend/src/lib/rule-match-utils.ts`
- `frontend/src/lib/transaction-status.ts`
- `frontend/src/lib/workspace-kinds.ts`

Each file must be classified before extraction:

| Classification | Treatment |
| --- | --- |
| Pure calculation or transformation | Move to shared core package after tests are portable |
| Uses browser globals | Keep a web adapter and create a native equivalent |
| React hook or context | Reimplement per platform around shared contracts |
| DOM/Radix/Tailwind component | Do not share with mobile |
| Financial rule with edge cases | Preserve existing tests and add platform-neutral tests |

### Internationalization

The web i18n entry point is:

- `frontend/src/lib/i18n.ts`

The locale JSON files are already the strongest reuse candidate. The browser
language detector and `document.documentElement.lang` synchronization must stay
in the web adapter. Mobile will use the same translation keys through a native
language resolver and workspace locale settings.

## Target shared package boundaries

The eventual workspace should contain the following shared packages. These are
planned boundaries, not files to create yet.

### `packages/api`

Responsibilities:

- HTTP transport abstraction.
- API endpoint methods grouped by domain.
- Request and response types.
- Auth response union for normal login and 2FA challenge.
- Workspace header handling.
- Typed API error representation.
- API version or capability metadata when added later.

The package must not read `localStorage`, `window`, `document`, AsyncStorage,
Keychain, or SQLite directly.

### `packages/core`

Responsibilities:

- Currency and amount formatting rules that do not depend on React.
- Date and timezone helpers.
- Workspace-kind and module visibility decisions.
- Transaction status labels and grouping.
- Category and rule evaluation helpers.
- Reusable reconciliation presentation calculations.

The package must not import React Native, React DOM, Tailwind, Radix, or Expo.

### `packages/i18n`

Responsibilities:

- Locale resource files.
- Supported language list.
- Language-tag normalization.
- Translation-key type generation if practical.
- Regional fallback rules.

The package must not perform browser detection or native storage itself.

### `packages/design-tokens`

Responsibilities:

- Semantic color roles.
- Typography roles.
- Spacing, radius, border, elevation, motion, icon, and touch-target values.
- Consumer/business financial status roles.
- Light and dark theme definitions.

It must not contain web DOM components or React Native components.

## API extraction sequence

### Step 1 — Freeze the current contract

Before moving anything:

1. Inventory every exported method in `frontend/src/lib/api.ts`.
2. Map each method to its backend route in `backend/app/api/`.
3. Compare each frontend type to its backend Pydantic response schema.
4. Record fields that are optional because of workspace modules.
5. Add or confirm frontend contract tests for auth, workspace selection,
   transactions, bank connections, and reconciliation.

### Step 2 — Introduce a platform-neutral transport

The shared API client should receive adapters for:

- Base URL.
- Token retrieval, storage, and clearing.
- Active workspace retrieval and storage.
- Unauthorized handling.
- Network timeout and retry policy.
- Request correlation/device metadata.

Web adapters should preserve current behavior. Native adapters should use
secure storage for credentials and should reset the native auth flow instead of
redirecting the browser.

### Step 3 — Migrate the web client without behavior changes

The web frontend should consume the shared client while retaining:

- Existing route names.
- Existing request payloads.
- Existing query keys.
- Existing error messages and loading behavior.
- Existing workspace header semantics.
- Existing auth redirect behavior through an adapter.

The migration is complete only when web tests and the production web build
pass with the shared package enabled.

### Step 4 — Add the native client

The native application should use the same endpoint methods but provide:

- Secure token storage.
- Persistent selected workspace storage.
- Native deep-link auth completion.
- Native network status handling.
- Background sync scheduling.

## Web UI reuse policy

The following should remain web-only:

- `frontend/src/components/`
- `frontend/src/pages/`
- Tailwind classes.
- Radix primitives.
- Browser-specific theme providers.
- Browser-specific file, PDF, and clipboard behavior.

Mobile screens should be rebuilt using native components while using the shared
domain contracts and semantic tokens.

## Query and cache mapping

The web uses TanStack Query. Mobile can use the same query concepts, but its
source of truth must be local SQLite first.

| Web behavior | Mobile behavior |
| --- | --- |
| Query cache | SQLite-backed repository plus query cache |
| Refetch on focus | Sync on foreground/network regain |
| Mutation invalidation | Local mutation, outbox enqueue, background sync |
| Browser loading state | Stable native screen shell with cached data/skeleton |
| Browser 401 redirect | Secure-session clear and native auth navigation |
| URL query filters | Local filter state plus API pagination |

## Frontend integration verification

Before mobile implementation is approved, the plan must produce evidence for:

1. Shared API types match the backend OpenAPI/Pydantic responses.
2. Web login, 2FA, workspace switching, transaction queries, and bank
   connections still pass their existing tests.
3. The shared client has no browser-global dependencies.
4. The mobile client can use a secure-storage adapter without code changes in
   endpoint methods.
5. Workspace module filtering remains server-authoritative.
