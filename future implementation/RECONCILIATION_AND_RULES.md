# Reconciliation, Matching, Splits, and Rules

## 1. Existing manual-to-bank matching

The current direct manual transaction matcher is:

```text
backend/app/services/connection_service.py:1373-1410
```

Function:

```python
_fuzzy_match_manual()
```

It requires:

```text
same account
external_id is null
source = manual
exact amount
same debit/credit type
date within ±3 days
token overlap >= 0.6
```

It is applied here:

```text
backend/app/services/connection_service.py:2163-2171
```

The matched manual row is changed to `source="sync"`. This is the correct
single-row direction, but it loses explicit reconciliation provenance.

Recommended replacement:

```text
backend/app/services/transaction_reconciliation_service.py
```

Use the existing matcher only as a compatibility fallback during migration.

## 2. Generic transaction matcher

Implementation:

```text
backend/app/services/transaction_match_service.py
```

Function:

```python
find_unique_transaction_match()
```

It supports amount/type/date filtering and normalized exact descriptions. It is
more conservative than `_fuzzy_match_manual()` and should be reused for import
compatibility.

## 3. Transfer reconciliation

Implementation:

```text
backend/app/services/transfer_detection_service.py
```

Main function:

```python
detect_transfer_pairs()
```

The service uses the pure engine in:

```text
backend/app/services/reconciliation_engine.py
```

Transfer matching supports:

```text
opposite directions
different accounts
same currency
amount tolerance
date windows
account-name mentions
mutual-best-match validation
ambiguous suggestions
```

This is a strong pattern for manual-bank matching.

## 4. Invoice and recurring reconciliation

Persistence/orchestration:

```text
backend/app/services/reconciliation_service.py
```

Pure decision engine:

```text
backend/app/services/reconciliation_engine.py
```

Suggestion persistence:

```text
backend/app/services/reconciliation_suggestion_service.py
```

The engine returns:

```text
linked
suggested
unmatched
```

It already supports:

```text
exact amounts
partial amounts
ratio amounts
sets of invoices
asymmetric date windows
description similarity
counterparty matching
ambiguity traces
```

The existing queue is exposed through:

```text
backend/app/api/reconciliation.py:389-465
frontend/src/components/reconciliation-queue.tsx
```

Extend this architecture with a manual-bank reconciliation node instead of
creating a second unrelated reconciliation framework.

## 5. Reconciliation policies

Shipped policy documents are in:

```text
backend/app/services/reconciliation_policy.py
```

Workspace overrides are resolved by:

```text
backend/app/services/reconciliation_rule_service.py
```

Existing policy nodes include:

```text
reconciliation.match_invoice
reconciliation.match_recurring
reconciliation.match_placeholder
reconciliation.match_transfer
```

Recommended new node:

```text
reconciliation.match_manual_bank
```

Suggested strategies:

```text
same_account_exact
same_account_tolerated_amount
same_account_merchant_similarity
ambiguous_manual_bank_match
```

## 6. Transaction splits

Social/group transaction splits are implemented in:

```text
backend/app/models/transaction_split.py
backend/app/services/split_service.py
backend/alembic/versions/044_split_transactions.py
```

These splits divide one parent transaction into participant shares. They are
not bank-feed split matching.

The reconciliation engine separately supports one payment settling several
expectations:

```text
backend/app/services/reconciliation_engine.py:394-431
backend/app/services/reconciliation_engine.py:592-690
```

Keep these concepts separate in the data model.

## 7. Categorization rules

Model:

```text
backend/app/models/rule.py
```

Schema:

```text
backend/app/schemas/rule.py
```

Pure evaluator:

```text
backend/app/services/rule_engine.py
```

Persistence/application service:

```text
backend/app/services/rule_service.py
```

Supported condition operators:

```text
contains
not_contains
starts_with
ends_with
not_equals
regex
lt
lte
```

Supported actions:

```text
set_category
set_payee
set_description
append_notes
ignore
```

Rules are ordered by priority and do not overwrite an explicitly supplied
category.

## 8. Recommended matching tiers

### Automatic merge

Require all of:

```text
score >= 0.92
amount exact or within strict minor-unit tolerance
text score >= 0.65
```

### Confirmation queue

Use when:

```text
score >= 0.60
```

but the candidate is ambiguous, the amount is approximate, or the date drift is
large.

### Distinct rows

If no candidate is viable:

```text
manual transaction → manual_only
bank transaction → bank_only
```

## 9. Merchant similarity

Use a normalized composite score:

```text
Unicode accent folding
punctuation removal
token containment
known payee aliases
compact-string similarity
```

The existing helpers are:

```text
backend/app/services/text_similarity.py
backend/app/services/transaction_match_service.py
```

They should be consolidated into a reusable matching utility rather than
duplicated between bank sync, import, and mobile code.
