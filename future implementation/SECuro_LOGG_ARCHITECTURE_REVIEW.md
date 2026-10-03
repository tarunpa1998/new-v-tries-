# Securo / Logg Architecture Review

## Scope

This document records the repository review for the planned offline-first Logg
mobile app. The target workflow is:

```text
Natural-language chat entry
        ↓
Local SQLite manual transaction
        ↓
Immediate optimistic balance update
        ↓
Enable Banking / Pluggy / SimpleFIN bank observation
        ↓
Deterministic reconciliation
        ├── automatic merge
        ├── 1-tap confirmation queue
        ├── manual-only transaction
        └── bank-only transaction
```

## Executive findings

1. Bank synchronization already exists for Pluggy, Enable Banking, and SimpleFIN.
2. Incremental synchronization already rewinds recent history to catch pending-
   to-posted transitions and late provider ingestion.
3. The backend already has substantial reconciliation infrastructure for
   invoices, recurring transactions, transfers, and imported/manual rows.
4. The transaction schema only has `posted` and `pending` states. It does not
   have first-class mobile settlement states, reconciliation IDs, confidence,
   or authorization/booking dates.
5. The current manual-to-bank matcher in
   `backend/app/services/connection_service.py` is a useful starting point,
   but it requires exact amounts, does not store a decision, does not handle
   ambiguous matches, and does not preserve immutable bank observations.
6. The mobile app is not currently implemented. The repository contains the
   planned architecture in `LOGG_MOBILE_IMPLEMENTATION.md`, but no `apps/`,
   `mobile-src/`, or `packages/` implementation directories.

## Existing major components

### Backend

| Area | Location |
| --- | --- |
| FastAPI entry point | `backend/app/main.py` |
| SQLAlchemy models | `backend/app/models/` |
| Alembic migrations | `backend/alembic/versions/` |
| Provider abstraction | `backend/app/providers/base.py` |
| Bank providers | `backend/app/providers/pluggy.py`, `enable_banking.py`, `simplefin.py` |
| Sync orchestration | `backend/app/services/connection_service.py` |
| Scheduled sync | `backend/app/tasks/sync_tasks.py` |
| Transaction service | `backend/app/services/transaction_service.py` |
| Generic matcher | `backend/app/services/transaction_match_service.py` |
| Reconciliation engine | `backend/app/services/reconciliation_engine.py` |
| Reconciliation persistence | `backend/app/services/reconciliation_service.py` |
| Transfer detection | `backend/app/services/transfer_detection_service.py` |
| Categorization engine | `backend/app/services/rule_engine.py` |
| Categorization service | `backend/app/services/rule_service.py` |

### Web frontend

| Area | Location |
| --- | --- |
| API client | `frontend/src/lib/api.ts` |
| Shared TypeScript types | `frontend/src/types/index.ts` |
| Transaction page | `frontend/src/pages/transactions.tsx` |
| Manual transaction dialog | `frontend/src/components/transaction-dialog.tsx` |
| Quick-add flow | `frontend/src/components/quick-add-transaction.tsx` |
| Reconciliation queue | `frontend/src/components/reconciliation-queue.tsx` |
| Reconciliation comparison | `frontend/src/components/reconciliation-pair.tsx` |
| Reconciliation history | `frontend/src/components/reconciliation-history.tsx` |

## Core architectural recommendation

Keep one canonical balance-affecting ledger row per economic event, and store
bank observations separately. A manual record and its later bank observation
must share a reconciliation identity and must not both contribute the full
amount to the account balance.

Recommended entities:

```text
transactions
bank_transaction_observations
transaction_reconciliation_candidates
transaction_reconciliation_events
```

The local mobile implementation in `mobile/` uses dedicated `logg_*` tables so
it can be integrated with the eventual mobile database without assuming that a
specific SQLite package has already been selected.

## Recommended settlement states

```typescript
type SettlementStatus =
  | "pending_settlement"
  | "reconciled"
  | "manual_only"
  | "bank_only";
```

`bank_only` is necessary to represent an incoming bank transaction for which no
manual transaction exists. It should not be disguised as `manual_only`.

Keep the matching result on a separate field:

```typescript
type ReconciliationState =
  | "open"
  | "auto_merged"
  | "needs_confirmation"
  | "confirmed"
  | "declined"
  | "not_applicable";
```

## Balance invariant

Every local transaction has a `balance_effect_applied` flag. A transaction's
signed amount is applied only on the transition from `false` to `true`.

When a pending manual row is reconciled:

```text
balance adjustment = signed(bank amount) - signed(manual amount)
```

The complete bank amount must never be applied a second time.

## Offline Kip recommendation

Use a two-stage parser:

1. Deterministic amount/date/direction/merchant/category parsing for common
   inputs such as `25€ party` and `60€ bread bakery`.
2. A small quantized local slot-filling model only when deterministic parsing
   cannot produce a valid record.

Do not make a generative model the critical path for the `<150ms` requirement.
Use constrained structured output plus Zod validation, and only permit category
and tax-rule IDs that already exist in the local SQLite context.
