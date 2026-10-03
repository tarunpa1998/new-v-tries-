# Future Implementation Checklist

## Repository and migration

- [ ] Create Alembic migration `097_delayed_transaction_reconciliation.py`.
- [ ] Clean existing duplicate `(account_id, external_id)` transaction rows.
- [ ] Add transaction settlement and reconciliation columns.
- [ ] Add separate bank observation table.
- [ ] Add reconciliation candidate table.
- [ ] Add transaction reconciliation event table.
- [ ] Add provider-scoped uniqueness indexes.
- [ ] Add `client_id` idempotency support.

## Provider normalization

- [ ] Preserve Enable Banking authorization, booking, and value dates.
- [ ] Preserve SimpleFIN `transacted_at` and `posted` independently.
- [ ] Preserve Pluggy transaction date fields where available.
- [ ] Preserve CAMT `BookgDt` and `ValDt` independently.
- [ ] Generate stable fingerprints only as a fallback, not as the sole identity.
- [ ] Store raw provider payloads.

## Backend reconciliation

- [ ] Create `transaction_reconciliation_service.py`.
- [ ] Replace exact-only manual matching.
- [ ] Add amount tolerance.
- [ ] Add date-drift scoring.
- [ ] Add normalized merchant similarity.
- [ ] Add candidate margin checks.
- [ ] Add auto-merge threshold.
- [ ] Add confirmation queue.
- [ ] Add manual-only resolution.
- [ ] Add bank-only materialization.
- [ ] Add modified-bank-record handling.
- [ ] Add balance delta application.
- [ ] Add event history.

## Mobile SQLite

- [ ] Benchmark official `expo-sqlite` first for the initial mobile release.
- [ ] Benchmark `@op-engineering/op-sqlite` only if the adapter needs higher
      throughput or FTS5 behavior.
- [ ] Implement the adapter interface used by `DelayedTransactionService`.
- [ ] Run `mobile/SQLITE_SCHEMA.sql` through a versioned migration.
- [ ] Store amounts as integer minor units.
- [ ] Store provider and client identities separately.
- [ ] Persist balance-effect application state.
- [ ] Add database transaction boundaries around every reconciliation.
- [ ] Add offline mutation queue.
- [ ] Retry idempotently after reconnect.

## Kip

- [ ] Keep the first release typed English/German text only.
- [ ] Ship deterministic amount/date/direction parsing first.
- [ ] Add local category alias retrieval.
- [ ] Add local tax-rule retrieval.
- [ ] Add Zod strict output validation.
- [ ] Add model adapter only for incomplete inputs.
- [ ] Use constrained structured decoding.
- [ ] Select and benchmark the on-device runtime before selecting a model.
- [ ] Benchmark Qwen2.5-1.5B-Instruct Q4 GGUF as the primary model candidate.
- [ ] Benchmark Qwen2.5-0.5B-Instruct as the lower-memory fallback.
- [ ] Treat `llama.rn` as a native integration spike, not a guaranteed final
      dependency.
- [ ] Test Metal acceleration on iOS and Vulkan/CPU fallback on Android.
- [ ] Download optional model weights only through signed/versioned assets.
- [ ] Keep typed prompts and on-device transcripts local by default.
- [ ] Disable cloud fallback unless the user explicitly enables it.
- [ ] Add offline speech recognition where the platform supports it.
- [ ] Fall back to typed input when offline speech is unavailable.
- [ ] Reject unknown category IDs.
- [ ] Reject unknown tax-rule IDs.
- [ ] Keep model context in memory after loading from SQLite.
- [ ] Measure p50/p95 parse latency on representative iOS and Android devices.
- [ ] Do not publish latency/RAM claims until device benchmarks exist.
- [ ] Defer fine-tuning until the base-model evaluation identifies repeatable
      failure patterns.

## Voice, receipts, and invoices

- [ ] Defer voice until typed Kip is stable.
- [ ] Prefer native on-device speech recognition when available.
- [ ] Fall back to typed input when offline speech is unavailable.
- [ ] Defer physical receipt OCR until document storage and privacy behavior are
      approved.
- [ ] Treat Austrian RKSV QR decoding as an optional verified path, not proof of
      compliance by itself.
- [ ] Validate official RKSV payload and certificate requirements.
- [ ] Do not treat `pdf-lib` as the PDF text-extraction engine.
- [ ] Select a text-PDF extractor and OCR fallback after a mobile spike.
- [ ] Preserve original documents and audit events before making retention or
      tax-compliance claims.
- [ ] Never let Kip invent BMD/RZL account codes.

## UX

- [ ] Show pending-settlement badge for manual entries.
- [ ] Show booking date after reconciliation.
- [ ] Show original chat description and bank description separately.
- [ ] Show capture date and bank booking date after linking.
- [ ] Show bank amount differences instead of hiding them.
- [ ] Provide a 1-tap confirmation queue.
- [ ] Explain amount, date, and merchant evidence.
- [ ] Provide “keep separate” action.
- [ ] Provide “manual only” action.
- [ ] Avoid hiding ambiguous matches silently.
- [ ] Ensure all mobile touch targets are at least 44×44 points.

## Verification

- [ ] Map every current `frontend/src/App.tsx` route to native, adapted,
      deep-link, temporary fallback, or later treatment.
- [ ] Confirm V1 core finance workflows are native and not generic WebView
      screens.
- [ ] Review every V1 screen against Apple HIG on iOS.
- [ ] Review every V1 screen against Material 3 and Android back behavior.
- [ ] Verify the app has one coherent visual language rather than generated
      one-off layouts.
- [ ] Test two identical manual transactions against two identical bank rows.
- [ ] Test one manual row against a pending and then posted bank row.
- [ ] Test bank amount modification after an earlier observation.
- [ ] Test bank external-ID re-keying.
- [ ] Test local model cannot invent a category or tax-rule ID.
- [ ] Test typed and voice prompts remain local by default.
- [ ] Test a declined candidate is not re-presented.
- [ ] Test offline replay does not duplicate the manual row.
- [ ] Test a reconciled row contributes exactly once to the balance.
- [ ] Test unmatched manual and bank rows remain distinct.
- [ ] Run backend tests.
- [ ] Run frontend typecheck and tests.
- [ ] Run mobile TypeScript checks once the mobile workspace exists.
