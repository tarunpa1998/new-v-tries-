# Backend Mobile API Plan

## Purpose

Define how iOS and Android consume the existing FastAPI backend, which current
routes can be reused immediately, and which additive capabilities are required
for reliable offline synchronization.

This plan does not implement backend changes.

## Backend remains authoritative

The mobile application must never import or reproduce:

- SQLAlchemy models.
- Provider credentials.
- Enable Banking, Pluggy, or SimpleFIN SDK logic.
- Bank synchronization scheduling.
- Server-side permission checks.
- Canonical reconciliation decisions.

Mobile may calculate optimistic presentation state locally, but PostgreSQL and
the backend remain authoritative for balances, bank observations, permissions,
and cross-device reconciliation.

## Existing routes to reuse

The router registration is in:

- `backend/app/main.py`

Important existing areas include:

| Domain | Backend route/source | Mobile use |
| --- | --- | --- |
| Local login | `backend/app/api/custom_auth.py` | Password login |
| 2FA | `backend/app/api/two_factor.py` | TOTP challenge completion |
| Passkeys | `backend/app/api/passkeys.py` | Later native passkey flow |
| User profile | User routes and schemas | Session bootstrap |
| Workspaces | `backend/app/api/workspaces.py` | Personal/business workspace switch |
| Accounts | `backend/app/api/accounts.py` | Account list and balances |
| Transactions | `backend/app/api/transactions.py` | Timeline, Kip settlement, edits |
| Connections | `backend/app/api/connections.py` | Bank connection and sync status |
| Reconciliation | `backend/app/api/reconciliation.py` | Candidate queue and rules |
| Categories | `backend/app/api/categories.py` | Offline category selection |
| Budgets/goals | Existing budget and goal routes | Consumer experience |
| Invoices | Existing invoice routes | Business workspace experience |
| Attachments | `backend/app/api/attachments.py` | Receipts and documents |

## Authentication contract

The current password login returns one of two shapes:

1. Access token and token type.
2. A temporary 2FA token with available methods.

The mobile plan must support both without assuming every user has 2FA enabled.

### Required mobile behavior

1. Submit the same form-encoded credentials as the web client.
2. Store a normal access token only in Keychain/Keystore-backed storage.
3. Keep a temporary 2FA token only for the active verification flow.
4. Never write passwords, TOTP secrets, or temporary tokens to logs.
5. On HTTP 401, clear the session and return to native authentication.
6. Rehydrate the user through the existing user endpoint after app restart.

### Later authentication additions

- Native passkey registration and login.
- Biometric unlock for the local session, not a replacement for server auth.
- OIDC deep-link completion if the current web flow is extended for native
  redirect URIs.
- Device/session management if multiple mobile devices must be revoked.

## Workspace and permissions contract

Mobile must send the active workspace identifier using the same header used by
the web client. The backend remains responsible for:

- Workspace membership.
- Owner/editor/viewer/manager permissions.
- Personal versus business workspace capabilities.
- `enabled_modules` resolution.
- `tax_jurisdiction`, locale, timezone, and default currency.

The client may hide unavailable modules for a clean UI, but it must treat a
backend denial as authoritative and show an actionable error.

## Proposed mobile bootstrap endpoint

The first mobile launch currently requires several requests. An additive
bootstrap endpoint can reduce startup waterfalls.

### Proposed route

`GET /api/mobile/bootstrap`

### Proposed response areas

- Current user.
- Workspaces the user can access.
- Selected workspace metadata.
- Enabled modules.
- Accounts and account balances.
- Categories and category groups.
- Sync cursor/version.
- Server capability flags.
- Current locale/currency/tax settings.

The response should remain bounded. Transactions and large report datasets
should be paginated or synchronized separately.

## Proposed offline synchronization endpoint

### Proposed route

`POST /api/mobile/sync`

### Request concepts

- Device identifier.
- Workspace identifier.
- Last successful server cursor.
- Pull request for changes since that cursor.
- Ordered outbox mutations.
- Client-generated idempotency identifiers.
- Schema/client version.

### Response concepts

- New server cursor.
- Canonical account changes.
- Canonical transaction changes.
- Category/rule changes.
- Reconciliation candidates and history changes.
- Accepted mutation IDs and server IDs.
- Conflicts requiring user action.
- Retryable failures.

### Server requirements

1. Replaying the same client mutation must not create duplicates.
2. Every accepted mutation must be traceable to a client ID and user/workspace.
3. Pull results must be scoped to the authenticated workspace.
4. A stale cursor must produce a recoverable full-resync instruction.
5. Server-generated bank transactions must remain distinguishable from local
   manual entries.
6. Financial amounts and currency fields must preserve the existing precision
   and FX semantics.

## Proposed mobile bank-connection flow

1. Mobile requests a provider authorization URL from the backend.
2. Backend creates the provider state and records the allowed redirect target.
3. Mobile opens the system browser.
4. Provider redirects to a validated mobile deep link.
5. Mobile validates scheme, host/path, state, and code presence.
6. Mobile sends the short-lived callback data to the backend.
7. Backend completes provider authorization and stores credentials server-side.
8. Backend schedules or performs synchronization.
9. Mobile displays connection progress and later downloads canonical data.

No provider secret or long-lived bank credential may enter the mobile bundle,
SQLite database, logs, analytics, or crash reports.

## Push notification contract

An additive device-token route will eventually be required:

- Register APNs and FCM device tokens.
- Associate tokens with the authenticated user/device.
- Revoke tokens on logout or invalid-provider response.
- Notify about failed bank sync, new reconciliation candidates, and required
  business actions.

Push notifications must never include balances, full transaction descriptions,
bank account identifiers, or other sensitive financial details.

## Backend data and migration plan

### Stage A — No schema change

Reuse current routes for authentication, workspaces, accounts, transactions,
categories, and reconciliation UI. This allows mobile shell development
without changing financial behavior.

### Stage B — Additive sync metadata

Add only the minimum required fields/tables for:

- Client mutation IDs.
- Device/session identity.
- Sync cursor or change version.
- Mutation result and conflict tracking.

Every migration must have an upgrade and rollback strategy.

### Stage C — Additive mobile routes

Introduce bootstrap, sync, redirect URI, and device-token routes behind tests.
The web frontend must continue using its existing routes during rollout.

## Backend security verification

The implementation plan must verify:

1. A token cannot access another workspace by changing the workspace header.
2. Viewer roles cannot submit writes through mobile endpoints.
3. Replayed client IDs do not duplicate transactions.
4. Sync responses cannot leak data from another workspace.
5. Deep-link callback state is single-use and expires.
6. Provider credentials never appear in mobile responses.
7. Logs and errors redact tokens, passwords, TOTP values, and bank data.
