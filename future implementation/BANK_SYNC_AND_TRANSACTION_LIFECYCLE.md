# Bank Synchronization and Transaction Lifecycle

## 1. Provider registry

Provider registration is implemented in:

```text
backend/app/providers/__init__.py:15-98
```

Known providers:

```text
pluggy
enable_banking
simplefin
```

The provider contract and normalized data classes are in:

```text
backend/app/providers/base.py:56-115
backend/app/providers/base.py:257-395
```

The current `TransactionData` fields are effectively:

```text
external_id
description
amount
date
type
currency
status
payee
raw_data
```

The contract does not yet promote authorization, booking, or value dates.

## 2. Enable Banking

Implementation:

```text
backend/app/providers/enable_banking.py
```

Important functions:

```text
EnableBankingProvider._jwt_token()
EnableBankingProvider._request()
EnableBankingProvider.handle_oauth_callback()
EnableBankingProvider.get_accounts()
EnableBankingProvider.get_transactions()
EnableBankingProvider._fetch_transactions()
EnableBankingProvider._build_transaction()
```

Locations:

```text
backend/app/providers/enable_banking.py:220-332
backend/app/providers/enable_banking.py:443-486
backend/app/providers/enable_banking.py:561-579
backend/app/providers/enable_banking.py:581-667
backend/app/providers/enable_banking.py:683-731
```

The provider handles booked/pending records, continuation keys, pagination loop
protection, consent expiry, rate limits, and restricted-mode user action.

Current date collapse:

```python
booking = _parse_iso_date(raw.get("booking_date"))
value = _parse_iso_date(raw.get("value_date"))
txn_date = booking or value or _parse_iso_date(raw.get("transaction_date"))
```

This should become:

```python
authorized_date = _parse_iso_date(raw.get("transaction_date"))
booking_date = _parse_iso_date(raw.get("booking_date"))
value_date = _parse_iso_date(raw.get("value_date"))
display_date = booking_date or value_date or authorized_date
```

## 3. Pluggy

Implementation:

```text
backend/app/providers/pluggy.py
```

Transaction fetching is in:

```text
backend/app/providers/pluggy.py:541-662
```

Pluggy uses the provider transaction ID as `external_id`, handles cursor
pagination, and uses `createdAtFrom` for incremental fetching. This is correct
for late-ingested rows whose bank transaction date is old.

Pluggy additionally normalizes:

```text
merchant/payee
payment data
pending status
installments
credit-card bill IDs
provider categories
account-currency conversion
```

## 4. SimpleFIN

Implementation:

```text
backend/app/providers/simplefin.py
```

Transaction fetching and normalization are in:

```text
backend/app/providers/simplefin.py:458-554
```

SimpleFIN uses its raw transaction ID and currently maps:

```python
posted → booking-like date
transacted_at → authorization-like date
```

The provider re-reads a broad window to handle delayed bridge exposure:

```text
backend/app/providers/simplefin.py:469-477
```

## 5. Sync orchestration

Scheduled synchronization:

```text
backend/app/worker.py:22-24
backend/app/tasks/sync_tasks.py:46-160
```

The main sync path is:

```text
backend/app/services/connection_service.py:1878-2487
```

The sequence is:

```text
lock connection
refresh credentials
optionally trigger upstream refresh
fetch accounts
upsert accounts
fetch credit-card bills
fetch transactions
deduplicate and merge
apply categorization rules
detect transfer pairs
reconcile invoices and recurring expectations
reconcile opening balance
sync holdings
commit
```

## 6. Current idempotency behavior

The sync first queries by:

```text
account_id + external_id
```

Location:

```text
backend/app/services/connection_service.py:2117-2138
```

The code tolerates old race-created duplicates by selecting the oldest row.
However, there is no database-level transaction uniqueness constraint in
`backend/app/models/transaction.py`.

Recent history is rewound by fourteen days:

```text
backend/app/services/connection_service.py:2098-2110
```

Pending-to-posted and provider re-keying are handled by:

```text
backend/app/services/connection_service.py:1441-1578
```

Phantom duplicate cleanup is handled by:

```text
backend/app/services/connection_service.py:1581-1642
```

## 7. Current modified-record limitation

The merge helper is:

```text
backend/app/services/connection_service.py:1413-1439
```

It preserves user-facing fields and merges raw data, but does not consistently
replace amount, type, currency, date, or existing display text when a provider
modifies a record.

The future implementation should distinguish:

```text
bank-authoritative fields
user-edited fields
rule-managed fields
derived fields
```

## 8. Transaction model

Current model:

```text
backend/app/models/transaction.py:23-118
```

Current transaction states:

```text
posted
pending
```

Current date fields:

```text
date
effective_date
effective_bill_date
```

`effective_date` is a reporting/credit-card billing date. It is not a bank
booking date.

Recommended additions:

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

## 9. Relevant frontend locations

Bank API client:

```text
frontend/src/lib/api.ts:435-532
```

Transaction type:

```text
frontend/src/types/index.ts:243-299
```

The web type currently declares:

```typescript
status: "posted" | "pending";
```

That type must be expanded only after the backend API contract changes.
