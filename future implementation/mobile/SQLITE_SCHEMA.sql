-- Logg mobile offline-first ledger schema.
--
-- Amounts are integer minor units. For EUR 25.40, store 2540.
--
-- The schema intentionally separates:
--   * canonical ledger transactions;
--   * raw bank-feed observations;
--   * reconciliation candidates;
--   * reconciliation history.
--
-- A bank observation may be linked to an existing manual transaction. In that
-- case the manual transaction remains the canonical ledger row and the bank
-- observation points to it.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS logg_accounts (
  id TEXT PRIMARY KEY NOT NULL,
  balance_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL CHECK (length(currency) = 3),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS logg_transactions (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL REFERENCES logg_accounts(id) ON DELETE CASCADE,
  client_id TEXT,

  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL CHECK (length(currency) = 3),
  direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),

  -- The economic/authorization date entered by the user or supplied by the
  -- provider. This is kept distinct from booking_date.
  occurred_at TEXT NOT NULL,
  authorized_at TEXT,

  -- Bank settlement/accounting dates. These remain null until the bank
  -- observation supplies them.
  booking_date TEXT,
  value_date TEXT,

  description TEXT NOT NULL,
  bank_description TEXT,
  category_id TEXT,
  payee TEXT,
  tax_rule_id TEXT,
  tax_amount_minor INTEGER,
  metadata_json TEXT,

  settlement_status TEXT NOT NULL CHECK (
    settlement_status IN (
      'pending_settlement',
      'reconciled',
      'manual_only',
      'bank_only'
    )
  ),
  reconciliation_state TEXT NOT NULL CHECK (
    reconciliation_state IN (
      'open',
      'auto_merged',
      'needs_confirmation',
      'confirmed',
      'declined',
      'not_applicable'
    )
  ),
  reconciliation_id TEXT,
  match_confidence REAL,

  -- Prevents applying the same signed amount twice when a manual row becomes
  -- reconciled with a bank observation.
  balance_effect_applied INTEGER NOT NULL DEFAULT 0 CHECK (
    balance_effect_applied IN (0, 1)
  ),

  -- Provider identity is stored on the canonical row after a bank-only row is
  -- materialized or a manual row is merged.
  bank_provider TEXT,
  bank_external_id TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_logg_transactions_client_id
  ON logg_transactions(account_id, client_id)
  WHERE client_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_logg_transactions_bank_identity
  ON logg_transactions(account_id, bank_provider, bank_external_id)
  WHERE bank_provider IS NOT NULL AND bank_external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_logg_transactions_pending
  ON logg_transactions(account_id, settlement_status, occurred_at);

CREATE TABLE IF NOT EXISTS logg_bank_feed (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL REFERENCES logg_accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,

  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL CHECK (length(currency) = 3),
  direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
  occurred_at TEXT NOT NULL,
  authorized_at TEXT,
  booking_date TEXT,
  value_date TEXT,
  description TEXT NOT NULL,
  raw_json TEXT,

  state TEXT NOT NULL CHECK (
    state IN ('received', 'matched', 'needs_confirmation', 'materialized')
  ),
  canonical_transaction_id TEXT REFERENCES logg_transactions(id) ON DELETE SET NULL,
  reconciliation_id TEXT,
  observed_at TEXT NOT NULL,

  UNIQUE(account_id, provider, external_id)
);

CREATE INDEX IF NOT EXISTS ix_logg_bank_feed_account_date
  ON logg_bank_feed(account_id, occurred_at);

CREATE TABLE IF NOT EXISTS logg_reconciliation_candidates (
  id TEXT PRIMARY KEY NOT NULL,
  manual_transaction_id TEXT NOT NULL REFERENCES logg_transactions(id) ON DELETE CASCADE,
  bank_feed_id TEXT NOT NULL REFERENCES logg_bank_feed(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  amount_score REAL NOT NULL,
  date_score REAL NOT NULL,
  text_score REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,

  UNIQUE(manual_transaction_id, bank_feed_id)
);

CREATE INDEX IF NOT EXISTS ix_logg_candidates_pending
  ON logg_reconciliation_candidates(status, created_at);

CREATE TABLE IF NOT EXISTS logg_reconciliation_events (
  id TEXT PRIMARY KEY NOT NULL,
  reconciliation_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (
    action IN ('auto_merged', 'confirmed', 'declined', 'materialized', 'unlinked')
  ),
  manual_transaction_id TEXT REFERENCES logg_transactions(id) ON DELETE SET NULL,
  bank_feed_id TEXT REFERENCES logg_bank_feed(id) ON DELETE SET NULL,
  confidence REAL,
  detail_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_logg_reconciliation_events_id
  ON logg_reconciliation_events(reconciliation_id, created_at);
