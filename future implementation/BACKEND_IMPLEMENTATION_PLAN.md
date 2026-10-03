# Backend Implementation Plan

## Phase 1: Add reconciliation persistence

Create:

```text
backend/alembic/versions/097_delayed_transaction_reconciliation.py
backend/app/models/bank_transaction_observation.py
backend/app/models/transaction_reconciliation.py
```

Update:

```text
backend/app/models/transaction.py
backend/app/models/__init__.py
```

Add transaction fields:

```text
authorized_at
booking_date
value_date
settlement_status
reconciliation_state
reconciliation_id
match_confidence
bank_provider
bank_external_id
bank_description
bank_raw_data
balance_effect_applied
client_id
```

Create a partial unique index for provider rows:

```text
(account_id, bank_provider, bank_external_id)
WHERE bank_provider IS NOT NULL AND bank_external_id IS NOT NULL
```

Before adding the index, clean existing transaction duplicates in the migration.

## Phase 2: Extend provider normalization

Update:

```text
backend/app/providers/base.py
backend/app/providers/enable_banking.py
backend/app/providers/pluggy.py
backend/app/providers/simplefin.py
backend/app/services/import_service.py
```

Extend `TransactionData` with:

```python
booking_date: Optional[date]
value_date: Optional[date]
```

Keep the existing `date` field for compatibility and map it to the display or
reporting date.

## Phase 3: Extract transaction reconciliation

Create:

```text
backend/app/services/transaction_reconciliation_service.py
```

Recommended functions:

```python
reconcile_manual_transaction()
reconcile_incoming_bank_observation()
score_manual_bank_candidates()
materialize_bank_only_transaction()
resolve_reconciliation_candidate()
apply_balance_delta_once()
```

Move the current logic from:

```text
backend/app/services/connection_service.py:_fuzzy_match_manual
```

into this service, keeping a compatibility wrapper during migration.

## Phase 4: Update sync behavior

Modify:

```text
backend/app/services/connection_service.py
```

The new flow should be:

```text
1. Normalize provider row
2. Insert/update bank observation using provider identity
3. Find existing canonical bank row
4. Find pending manual candidates
5. Auto-merge or create candidates
6. Materialize bank-only when no candidate exists
7. Preserve user fields and update only bank-authoritative fields
8. Apply only amount deltas to local balance projections
```

Do not change `source` from `manual` to `sync` as the only indication of a
match. Preserve provenance with reconciliation fields.

## Phase 5: API contract

Update:

```text
backend/app/schemas/transaction.py
backend/app/schemas/reconciliation.py
backend/app/api/transactions.py
backend/app/api/reconciliation.py
```

Add read fields:

```text
settlement_status
reconciliation_state
reconciliation_id
match_confidence
booking_date
value_date
```

Add candidate routes:

```text
GET  /api/reconciliation/transactions/pending
GET  /api/reconciliation/transactions/candidates
POST /api/reconciliation/transactions/{candidate_id}/accept
POST /api/reconciliation/transactions/{candidate_id}/decline
POST /api/reconciliation/transactions/{transaction_id}/keep-manual
```

Add `client_id` to create requests for offline replay idempotency. Do not use
`external_id` for mobile client IDs.

## Phase 6: Shared policy node

Extend:

```text
backend/app/services/reconciliation_policy.py
backend/app/services/reconciliation_rule_service.py
backend/app/services/reconciliation_engine.py
```

Add:

```text
reconciliation.match_manual_bank
```

The existing engine should remain pure. Database loading and writes belong in
the service layer.

## Phase 7: Tests

Add backend tests for:

```text
exact manual/bank merge
amount tolerance
date drift
merchant variation
ambiguous candidates
manual-only resolution
bank-only materialization
provider re-sync idempotency
modified bank amounts
pending-to-posted provider transitions
no double balance effect
client replay idempotency
```

Suggested files:

```text
backend/tests/test_transaction_reconciliation_service.py
backend/tests/test_bank_transaction_observations.py
backend/tests/test_delayed_transaction_balances.py
```

## Design constraints

1. Never use floating-point values for money.
2. Never apply a full bank amount when a manual amount already affected the
   balance.
3. Never let a fuzzy score alone override a user decision.
4. Never overwrite user-edited descriptions or categories with provider data.
5. Keep provider raw data for audit and future parser improvements.
6. Keep the pure matching engine database-free.
