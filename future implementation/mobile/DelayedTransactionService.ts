export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type SqlValue = string | number | null;

export interface SqliteRunResult {
  readonly changes: number;
  readonly lastInsertRowId?: number;
}

/**
 * Small adapter surface for expo-sqlite, react-native-quick-sqlite, or a test
 * SQLite implementation. The adapter owns BEGIN/COMMIT/ROLLBACK semantics.
 */
export interface SqliteDatabase {
  exec(sql: string): Promise<void>;
  run(
    sql: string,
    params?: readonly SqlValue[],
  ): Promise<SqliteRunResult>;
  get<T extends object>(
    sql: string,
    params?: readonly SqlValue[],
  ): Promise<T | undefined>;
  all<T extends object>(
    sql: string,
    params?: readonly SqlValue[],
  ): Promise<readonly T[]>;
  transaction<T>(work: () => Promise<T>): Promise<T>;
}

export type TransactionDirection = "debit" | "credit";

export type SettlementStatus =
  | "pending_settlement"
  | "reconciled"
  | "manual_only"
  | "bank_only";

export type ReconciliationState =
  | "open"
  | "auto_merged"
  | "needs_confirmation"
  | "confirmed"
  | "declined"
  | "not_applicable";

export type CandidateStatus = "pending" | "accepted" | "declined";

export interface ManualTransactionInput {
  readonly accountId: string;
  readonly clientId: string;
  readonly amountMinor: number;
  readonly currency: string;
  readonly direction: TransactionDirection;
  readonly occurredAt: string;
  readonly authorizedAt?: string | null;
  readonly description: string;
  readonly categoryId?: string | null;
  readonly payee?: string | null;
  readonly taxRuleId?: string | null;
  readonly taxAmountMinor?: number | null;
  readonly metadata?: JsonValue;
}

export interface BankTransactionInput {
  readonly accountId: string;
  readonly provider: string;
  readonly externalId: string;
  readonly amountMinor: number;
  readonly currency: string;
  readonly direction: TransactionDirection;
  readonly occurredAt: string;
  readonly authorizedAt?: string | null;
  readonly bookingDate?: string | null;
  readonly valueDate?: string | null;
  readonly description: string;
  readonly rawData?: JsonValue;
}

export interface LocalTransaction {
  readonly id: string;
  readonly accountId: string;
  readonly clientId: string | null;
  readonly amountMinor: number;
  readonly currency: string;
  readonly direction: TransactionDirection;
  readonly occurredAt: string;
  readonly authorizedAt: string | null;
  readonly bookingDate: string | null;
  readonly valueDate: string | null;
  readonly description: string;
  readonly bankDescription: string | null;
  readonly categoryId: string | null;
  readonly payee: string | null;
  readonly settlementStatus: SettlementStatus;
  readonly reconciliationState: ReconciliationState;
  readonly reconciliationId: string | null;
  readonly matchConfidence: number | null;
  readonly balanceEffectApplied: boolean;
}

interface TransactionRow {
  id: string;
  account_id: string;
  client_id: string | null;
  amount_minor: number;
  currency: string;
  direction: TransactionDirection;
  occurred_at: string;
  authorized_at: string | null;
  booking_date: string | null;
  value_date: string | null;
  description: string;
  bank_description: string | null;
  category_id: string | null;
  payee: string | null;
  settlement_status: SettlementStatus;
  reconciliation_state: ReconciliationState;
  reconciliation_id: string | null;
  match_confidence: number | null;
  balance_effect_applied: number;
}

interface FeedRow {
  id: string;
  account_id: string;
  provider: string;
  external_id: string;
  amount_minor: number;
  currency: string;
  direction: TransactionDirection;
  occurred_at: string;
  authorized_at: string | null;
  booking_date: string | null;
  value_date: string | null;
  description: string;
  state: "received" | "matched" | "needs_confirmation" | "materialized";
  canonical_transaction_id: string | null;
  reconciliation_id: string | null;
}

interface CandidateRow {
  id: string;
  manual_transaction_id: string;
  bank_feed_id: string;
  score: number;
  amount_score: number;
  date_score: number;
  text_score: number;
  status: CandidateStatus;
}

interface CandidateScore {
  readonly manual: TransactionRow;
  readonly total: number;
  readonly amount: number;
  readonly date: number;
  readonly text: number;
  readonly dateDistanceDays: number;
}

export interface ReconciliationResult {
  readonly autoMerged: readonly LocalTransaction[];
  readonly confirmationCandidateIds: readonly string[];
  readonly bankOnly: readonly LocalTransaction[];
  readonly modified: readonly LocalTransaction[];
}

export interface ReconciliationConfig {
  readonly amountToleranceMinor: number;
  readonly amountTolerancePercent: number;
  readonly maxDateDistanceDays: number;
  readonly autoDateDistanceDays: number;
  readonly autoThreshold: number;
  readonly suggestionThreshold: number;
  readonly autoMargin: number;
}

const DEFAULT_CONFIG: ReconciliationConfig = {
  amountToleranceMinor: 2,
  amountTolerancePercent: 0.01,
  maxDateDistanceDays: 7,
  autoDateDistanceDays: 3,
  autoThreshold: 0.92,
  suggestionThreshold: 0.6,
  autoMargin: 0.08,
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS logg_accounts (
  id TEXT PRIMARY KEY NOT NULL,
  balance_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS logg_transactions (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL,
  client_id TEXT,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL CHECK (length(currency) = 3),
  direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
  occurred_at TEXT NOT NULL,
  authorized_at TEXT,
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
    settlement_status IN ('pending_settlement', 'reconciled', 'manual_only', 'bank_only')
  ),
  reconciliation_state TEXT NOT NULL CHECK (
    reconciliation_state IN (
      'open', 'auto_merged', 'needs_confirmation', 'confirmed',
      'declined', 'not_applicable'
    )
  ),
  reconciliation_id TEXT,
  match_confidence REAL,
  balance_effect_applied INTEGER NOT NULL DEFAULT 0 CHECK (
    balance_effect_applied IN (0, 1)
  ),
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
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  direction TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  authorized_at TEXT,
  booking_date TEXT,
  value_date TEXT,
  description TEXT NOT NULL,
  raw_json TEXT,
  state TEXT NOT NULL CHECK (
    state IN ('received', 'matched', 'needs_confirmation', 'materialized')
  ),
  canonical_transaction_id TEXT,
  reconciliation_id TEXT,
  observed_at TEXT NOT NULL,
  UNIQUE(account_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS logg_reconciliation_candidates (
  id TEXT PRIMARY KEY NOT NULL,
  manual_transaction_id TEXT NOT NULL,
  bank_feed_id TEXT NOT NULL,
  score REAL NOT NULL,
  amount_score REAL NOT NULL,
  date_score REAL NOT NULL,
  text_score REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE(manual_transaction_id, bank_feed_id)
);

CREATE TABLE IF NOT EXISTS logg_reconciliation_events (
  id TEXT PRIMARY KEY NOT NULL,
  reconciliation_id TEXT NOT NULL,
  action TEXT NOT NULL,
  manual_transaction_id TEXT,
  bank_feed_id TEXT,
  confidence REAL,
  detail_json TEXT,
  created_at TEXT NOT NULL
);
`;

function createId(): string {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject !== undefined && "randomUUID" in cryptoObject) {
    return cryptoObject.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertMinorAmount(amountMinor: number): void {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    throw new Error("amountMinor must be a positive safe integer");
  }
}

function assertIsoDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Expected YYYY-MM-DD date, received: ${value}`);
  }
}

function assertOptionalIsoDate(value: string | null | undefined): void {
  if (value !== null && value !== undefined) {
    assertIsoDate(value);
  }
}

function signedAmount(
  amountMinor: number,
  direction: TransactionDirection,
): number {
  return direction === "debit" ? -amountMinor : amountMinor;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textSimilarity(left: string, right: string): number {
  const leftTokens = new Set(normalizeText(left).split(/\s+/).filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(/\s+/).filter(Boolean));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  const jaccard = intersection / union;
  const leftCompact = [...leftTokens].join("");
  const rightCompact = [...rightTokens].join("");
  const contained =
    leftCompact.includes(rightCompact) || rightCompact.includes(leftCompact)
      ? 1
      : 0;

  return jaccard * 0.7 + contained * 0.3;
}

function dateDistance(left: string, right: string): number {
  const leftTime = Date.parse(`${left}T00:00:00Z`);
  const rightTime = Date.parse(`${right}T00:00:00Z`);

  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.abs(leftTime - rightTime) / 86_400_000;
}

export class DelayedTransactionService {
  private readonly config: ReconciliationConfig;

  public constructor(
    private readonly db: SqliteDatabase,
    config: Partial<ReconciliationConfig> = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public async ensureSchema(): Promise<void> {
    await this.db.exec(SCHEMA_SQL);
  }

  public async queueManualTransaction(
    input: ManualTransactionInput,
  ): Promise<LocalTransaction> {
    assertMinorAmount(input.amountMinor);
    assertIsoDate(input.occurredAt);
    assertOptionalIsoDate(input.authorizedAt);

    return this.db.transaction(async () => {
      const existing = await this.db.get<TransactionRow>(
        `
        SELECT *
        FROM logg_transactions
        WHERE account_id = ? AND client_id = ?
        `,
        [input.accountId, input.clientId],
      );

      if (existing !== undefined) {
        return this.toLocalTransaction(existing);
      }

      const transactionId = createId();
      const timestamp = nowIso();

      await this.db.run(
        `
        INSERT INTO logg_transactions (
          id, account_id, client_id, amount_minor, currency, direction,
          occurred_at, authorized_at, description, category_id, payee,
          tax_rule_id, tax_amount_minor, settlement_status,
          reconciliation_state, balance_effect_applied, metadata_json,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `,
        [
          transactionId,
          input.accountId,
          input.clientId,
          input.amountMinor,
          input.currency.toUpperCase(),
          input.direction,
          input.occurredAt,
          input.authorizedAt ?? null,
          input.description.trim(),
          input.categoryId ?? null,
          input.payee ?? null,
          input.taxRuleId ?? null,
          input.taxAmountMinor ?? null,
          "pending_settlement",
          "open",
          input.metadata === undefined ? null : JSON.stringify(input.metadata),
          timestamp,
          timestamp,
        ],
      );

      await this.applyBalanceDelta(
        input.accountId,
        signedAmount(input.amountMinor, input.direction),
      );

      const created = await this.db.get<TransactionRow>(
        "SELECT * FROM logg_transactions WHERE id = ?",
        [transactionId],
      );

      if (created === undefined) {
        throw new Error("Manual transaction was not created");
      }

      return this.toLocalTransaction(created);
    });
  }

  public async reconcileWithIncomingBankFeed(
    bankTxList: readonly BankTransactionInput[],
  ): Promise<ReconciliationResult> {
    const autoMerged: LocalTransaction[] = [];
    const confirmationCandidateIds: string[] = [];
    const bankOnly: LocalTransaction[] = [];
    const modified: LocalTransaction[] = [];

    for (const bankTx of bankTxList) {
      const result = await this.db.transaction(async () =>
        this.reconcileOne(bankTx),
      );

      if (result.kind === "auto_merged") {
        autoMerged.push(result.transaction);
      } else if (result.kind === "needs_confirmation") {
        confirmationCandidateIds.push(...result.candidateIds);
      } else if (result.kind === "bank_only") {
        bankOnly.push(result.transaction);
      } else {
        modified.push(result.transaction);
      }
    }

    return { autoMerged, confirmationCandidateIds, bankOnly, modified };
  }

  public async resolveCandidate(
    candidateId: string,
    action: "confirm" | "keep_distinct",
  ): Promise<LocalTransaction> {
    return this.db.transaction(async () => {
      const candidate = await this.db.get<CandidateRow>(
        `
        SELECT *
        FROM logg_reconciliation_candidates
        WHERE id = ? AND status = 'pending'
        `,
        [candidateId],
      );

      if (candidate === undefined) {
        throw new Error("Reconciliation candidate is missing or resolved");
      }

      const feed = await this.db.get<FeedRow>(
        "SELECT * FROM logg_bank_feed WHERE id = ?",
        [candidate.bank_feed_id],
      );

      if (feed === undefined) {
        throw new Error("Bank observation is missing");
      }

      if (action === "confirm") {
        const manual = await this.db.get<TransactionRow>(
          "SELECT * FROM logg_transactions WHERE id = ?",
          [candidate.manual_transaction_id],
        );

        if (manual === undefined) {
          throw new Error("Manual transaction is missing");
        }

        const merged = await this.mergeManualWithBank(
          manual,
          feed,
          candidate.score,
          "confirmed",
        );

        await this.db.run(
          `
          UPDATE logg_reconciliation_candidates
          SET status = CASE WHEN id = ? THEN 'accepted' ELSE 'declined' END,
              resolved_at = ?
          WHERE bank_feed_id = ? AND status = 'pending'
          `,
          [candidateId, nowIso(), feed.id],
        );

        return merged;
      }

      await this.db.run(
        `
        UPDATE logg_reconciliation_candidates
        SET status = 'declined', resolved_at = ?
        WHERE bank_feed_id = ? AND status = 'pending'
        `,
        [nowIso(), feed.id],
      );

      return this.materializeBankOnly(feed);
    });
  }

  public async markManualOnly(
    transactionId: string,
  ): Promise<LocalTransaction> {
    await this.db.run(
      `
      UPDATE logg_transactions
      SET settlement_status = 'manual_only',
          reconciliation_state = 'declined',
          updated_at = ?
      WHERE id = ? AND settlement_status = 'pending_settlement'
      `,
      [nowIso(), transactionId],
    );

    const row = await this.db.get<TransactionRow>(
      "SELECT * FROM logg_transactions WHERE id = ?",
      [transactionId],
    );

    if (row === undefined) {
      throw new Error("Manual transaction was not found");
    }

    return this.toLocalTransaction(row);
  }

  private async reconcileOne(bankTx: BankTransactionInput): Promise<
    | { readonly kind: "auto_merged"; readonly transaction: LocalTransaction }
    | {
        readonly kind: "needs_confirmation";
        readonly candidateIds: readonly string[];
      }
    | { readonly kind: "bank_only"; readonly transaction: LocalTransaction }
    | { readonly kind: "modified"; readonly transaction: LocalTransaction }
  > {
    assertMinorAmount(bankTx.amountMinor);
    assertIsoDate(bankTx.occurredAt);
    assertOptionalIsoDate(bankTx.authorizedAt);
    assertOptionalIsoDate(bankTx.bookingDate);
    assertOptionalIsoDate(bankTx.valueDate);

    let feed = await this.db.get<FeedRow>(
      `
      SELECT *
      FROM logg_bank_feed
      WHERE account_id = ? AND provider = ? AND external_id = ?
      `,
      [bankTx.accountId, bankTx.provider, bankTx.externalId],
    );

    if (feed !== undefined && (feed.state === "matched" || feed.state === "materialized")) {
      return {
        kind: "modified",
        transaction: await this.updateMaterializedObservation(feed, bankTx),
      };
    }

    if (feed === undefined) {
      const feedId = createId();

      await this.db.run(
        `
        INSERT INTO logg_bank_feed (
          id, account_id, provider, external_id, amount_minor, currency,
          direction, occurred_at, authorized_at, booking_date, value_date,
          description, raw_json, state, observed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?)
        `,
        [
          feedId,
          bankTx.accountId,
          bankTx.provider,
          bankTx.externalId,
          bankTx.amountMinor,
          bankTx.currency.toUpperCase(),
          bankTx.direction,
          bankTx.occurredAt,
          bankTx.authorizedAt ?? null,
          bankTx.bookingDate ?? null,
          bankTx.valueDate ?? null,
          bankTx.description,
          bankTx.rawData === undefined ? null : JSON.stringify(bankTx.rawData),
          nowIso(),
        ],
      );

      feed = await this.db.get<FeedRow>(
        "SELECT * FROM logg_bank_feed WHERE id = ?",
        [feedId],
      );
    } else {
      await this.db.run(
        `
        UPDATE logg_bank_feed
        SET amount_minor = ?, currency = ?, direction = ?, occurred_at = ?,
            authorized_at = ?, booking_date = ?, value_date = ?,
            description = ?, raw_json = ?, state = 'received', observed_at = ?
        WHERE id = ?
        `,
        [
          bankTx.amountMinor,
          bankTx.currency.toUpperCase(),
          bankTx.direction,
          bankTx.occurredAt,
          bankTx.authorizedAt ?? null,
          bankTx.bookingDate ?? null,
          bankTx.valueDate ?? null,
          bankTx.description,
          bankTx.rawData === undefined ? null : JSON.stringify(bankTx.rawData),
          nowIso(),
          feed.id,
        ],
      );

      await this.db.run(
        `
        DELETE FROM logg_reconciliation_candidates
        WHERE bank_feed_id = ? AND status = 'pending'
        `,
        [feed.id],
      );

      feed = await this.db.get<FeedRow>(
        "SELECT * FROM logg_bank_feed WHERE id = ?",
        [feed.id],
      );
    }

    if (feed === undefined) {
      throw new Error("Bank observation was not persisted");
    }

    const pendingManualRows = await this.db.all<TransactionRow>(
      `
      SELECT *
      FROM logg_transactions
      WHERE account_id = ?
        AND settlement_status = 'pending_settlement'
        AND reconciliation_id IS NULL
        AND currency = ?
        AND direction = ?
      `,
      [bankTx.accountId, bankTx.currency.toUpperCase(), bankTx.direction],
    );

    const scored = pendingManualRows
      .map((manual) => this.score(manual, bankTx))
      .filter((candidate): candidate is CandidateScore => candidate !== null)
      .sort((left, right) => right.total - left.total);

    const top = scored[0];
    const second = scored[1];

    if (top === undefined) {
      return { kind: "bank_only", transaction: await this.materializeBankOnly(feed) };
    }

    const margin = second === undefined ? 1 : top.total - second.total;
    const shouldAutoMerge =
      top.total >= this.config.autoThreshold &&
      margin >= this.config.autoMargin &&
      top.amount >= 0.99 &&
      top.dateDistanceDays <= this.config.autoDateDistanceDays &&
      top.text >= 0.65;

    if (shouldAutoMerge) {
      return {
        kind: "auto_merged",
        transaction: await this.mergeManualWithBank(
          top.manual,
          feed,
          top.total,
          "auto_merged",
        ),
      };
    }

    const viable = scored.filter(
      (candidate) => candidate.total >= this.config.suggestionThreshold,
    );

    if (viable.length > 0) {
      const candidateIds: string[] = [];

      await this.db.run(
        "UPDATE logg_bank_feed SET state = 'needs_confirmation' WHERE id = ?",
        [feed.id],
      );

      for (const candidate of viable.slice(0, 3)) {
        const id = createId();

        await this.db.run(
          `
          INSERT INTO logg_reconciliation_candidates (
            id, manual_transaction_id, bank_feed_id, score,
            amount_score, date_score, text_score, status, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
          `,
          [
            id,
            candidate.manual.id,
            feed.id,
            candidate.total,
            candidate.amount,
            candidate.date,
            candidate.text,
            nowIso(),
          ],
        );

        candidateIds.push(id);
      }

      return { kind: "needs_confirmation", candidateIds };
    }

    return { kind: "bank_only", transaction: await this.materializeBankOnly(feed) };
  }

  private score(
    manual: TransactionRow,
    bank: BankTransactionInput,
  ): CandidateScore | null {
    const amountDifference = Math.abs(manual.amount_minor - bank.amountMinor);
    const allowedDifference = Math.max(
      this.config.amountToleranceMinor,
      Math.round(bank.amountMinor * this.config.amountTolerancePercent),
    );

    if (amountDifference > allowedDifference) {
      return null;
    }

    const bankDate = bank.bookingDate ?? bank.occurredAt;
    const distance = dateDistance(manual.occurred_at, bankDate);

    if (distance > this.config.maxDateDistanceDays) {
      return null;
    }

    const amount =
      amountDifference === 0
        ? 1
        : 1 - amountDifference / Math.max(1, allowedDifference);
    const date = Math.max(
      0,
      1 - distance / Math.max(1, this.config.maxDateDistanceDays),
    );
    const text = textSimilarity(manual.description, bank.description);
    const total = amount * 0.5 + date * 0.2 + text * 0.3;

    return {
      manual,
      total,
      amount,
      date,
      text,
      dateDistanceDays: distance,
    };
  }

  private async mergeManualWithBank(
    manual: TransactionRow,
    feed: FeedRow,
    confidence: number,
    state: "auto_merged" | "confirmed",
  ): Promise<LocalTransaction> {
    const bankSigned = signedAmount(feed.amount_minor, feed.direction);
    const manualSigned = signedAmount(manual.amount_minor, manual.direction);

    await this.applyBalanceDelta(
      manual.account_id,
      manual.balance_effect_applied === 1
        ? bankSigned - manualSigned
        : bankSigned,
    );

    const reconciliationId = manual.reconciliation_id ?? createId();
    const timestamp = nowIso();

    await this.db.run(
      `
      UPDATE logg_transactions
      SET amount_minor = ?, currency = ?, direction = ?,
          booking_date = ?, value_date = ?, authorized_at = ?,
          bank_description = ?, settlement_status = 'reconciled',
          reconciliation_state = ?, reconciliation_id = ?,
          match_confidence = ?, balance_effect_applied = 1,
          bank_provider = ?, bank_external_id = ?, updated_at = ?
      WHERE id = ?
      `,
      [
        feed.amount_minor,
        feed.currency,
        feed.direction,
        feed.booking_date ?? feed.occurred_at,
        feed.value_date,
        feed.authorized_at,
        feed.description,
        state,
        reconciliationId,
        confidence,
        feed.provider,
        feed.external_id,
        timestamp,
        manual.id,
      ],
    );

    await this.db.run(
      `
      UPDATE logg_bank_feed
      SET state = 'matched', canonical_transaction_id = ?,
          reconciliation_id = ?
      WHERE id = ?
      `,
      [manual.id, reconciliationId, feed.id],
    );

    await this.recordEvent(
      reconciliationId,
      state,
      manual.id,
      feed.id,
      confidence,
    );

    const merged = await this.db.get<TransactionRow>(
      "SELECT * FROM logg_transactions WHERE id = ?",
      [manual.id],
    );

    if (merged === undefined) {
      throw new Error("Merged transaction was not found");
    }

    return this.toLocalTransaction(merged);
  }

  private async materializeBankOnly(feed: FeedRow): Promise<LocalTransaction> {
    if (feed.canonical_transaction_id !== null && feed.state === "materialized") {
      const existing = await this.db.get<TransactionRow>(
        "SELECT * FROM logg_transactions WHERE id = ?",
        [feed.canonical_transaction_id],
      );

      if (existing === undefined) {
        throw new Error("Materialized bank transaction was deleted");
      }

      return this.toLocalTransaction(existing);
    }

    const transactionId = createId();
    const reconciliationId = feed.reconciliation_id ?? createId();
    const timestamp = nowIso();

    await this.db.run(
      `
      INSERT INTO logg_transactions (
        id, account_id, amount_minor, currency, direction,
        occurred_at, authorized_at, booking_date, value_date,
        description, bank_description, settlement_status,
        reconciliation_state, reconciliation_id, match_confidence,
        balance_effect_applied, bank_provider, bank_external_id,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'bank_only',
              'not_applicable', ?, NULL, 1, ?, ?, ?, ?)
      `,
      [
        transactionId,
        feed.account_id,
        feed.amount_minor,
        feed.currency,
        feed.direction,
        feed.occurred_at,
        feed.authorized_at,
        feed.booking_date,
        feed.value_date,
        feed.description,
        feed.description,
        reconciliationId,
        feed.provider,
        feed.external_id,
        timestamp,
        timestamp,
      ],
    );

    await this.applyBalanceDelta(
      feed.account_id,
      signedAmount(feed.amount_minor, feed.direction),
    );

    await this.db.run(
      `
      UPDATE logg_bank_feed
      SET state = 'materialized', canonical_transaction_id = ?,
          reconciliation_id = ?
      WHERE id = ?
      `,
      [transactionId, reconciliationId, feed.id],
    );

    await this.recordEvent(
      reconciliationId,
      "materialized",
      null,
      feed.id,
      null,
    );

    const created = await this.db.get<TransactionRow>(
      "SELECT * FROM logg_transactions WHERE id = ?",
      [transactionId],
    );

    if (created === undefined) {
      throw new Error("Bank-only transaction was not created");
    }

    return this.toLocalTransaction(created);
  }

  private async updateMaterializedObservation(
    feed: FeedRow,
    bank: BankTransactionInput,
  ): Promise<LocalTransaction> {
    if (feed.canonical_transaction_id === null) {
      throw new Error("Materialized feed has no canonical transaction");
    }

    const current = await this.db.get<TransactionRow>(
      "SELECT * FROM logg_transactions WHERE id = ?",
      [feed.canonical_transaction_id],
    );

    if (current === undefined) {
      throw new Error("Canonical bank transaction was deleted");
    }

    const oldSigned = signedAmount(current.amount_minor, current.direction);
    const newSigned = signedAmount(bank.amountMinor, bank.direction);

    await this.applyBalanceDelta(current.account_id, newSigned - oldSigned);

    await this.db.run(
      `
      UPDATE logg_transactions
      SET amount_minor = ?, currency = ?, direction = ?,
          occurred_at = ?, authorized_at = ?, booking_date = ?,
          value_date = ?, bank_description = ?, bank_provider = ?,
          bank_external_id = ?, updated_at = ?
      WHERE id = ?
      `,
      [
        bank.amountMinor,
        bank.currency.toUpperCase(),
        bank.direction,
        bank.occurredAt,
        bank.authorizedAt ?? null,
        bank.bookingDate ?? null,
        bank.valueDate ?? null,
        bank.description,
        bank.provider,
        bank.externalId,
        nowIso(),
        current.id,
      ],
    );

    await this.db.run(
      `
      UPDATE logg_bank_feed
      SET amount_minor = ?, currency = ?, direction = ?,
          occurred_at = ?, authorized_at = ?, booking_date = ?,
          value_date = ?, description = ?, raw_json = ?, observed_at = ?
      WHERE id = ?
      `,
      [
        bank.amountMinor,
        bank.currency.toUpperCase(),
        bank.direction,
        bank.occurredAt,
        bank.authorizedAt ?? null,
        bank.bookingDate ?? null,
        bank.valueDate ?? null,
        bank.description,
        bank.rawData === undefined ? null : JSON.stringify(bank.rawData),
        nowIso(),
        feed.id,
      ],
    );

    const updated = await this.db.get<TransactionRow>(
      "SELECT * FROM logg_transactions WHERE id = ?",
      [current.id],
    );

    if (updated === undefined) {
      throw new Error("Updated bank transaction was not found");
    }

    return this.toLocalTransaction(updated);
  }

  private async applyBalanceDelta(
    accountId: string,
    deltaMinor: number,
  ): Promise<void> {
    if (deltaMinor === 0) {
      return;
    }

    const result = await this.db.run(
      `
      UPDATE logg_accounts
      SET balance_minor = balance_minor + ?, updated_at = ?
      WHERE id = ?
      `,
      [deltaMinor, nowIso(), accountId],
    );

    if (result.changes !== 1) {
      throw new Error(`Account ${accountId} was not found`);
    }
  }

  private async recordEvent(
    reconciliationId: string,
    action: string,
    manualTransactionId: string | null,
    bankFeedId: string | null,
    confidence: number | null,
  ): Promise<void> {
    await this.db.run(
      `
      INSERT INTO logg_reconciliation_events (
        id, reconciliation_id, action, manual_transaction_id,
        bank_feed_id, confidence, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        createId(),
        reconciliationId,
        action,
        manualTransactionId,
        bankFeedId,
        confidence,
        nowIso(),
      ],
    );
  }

  private toLocalTransaction(row: TransactionRow): LocalTransaction {
    return {
      id: row.id,
      accountId: row.account_id,
      clientId: row.client_id,
      amountMinor: row.amount_minor,
      currency: row.currency,
      direction: row.direction,
      occurredAt: row.occurred_at,
      authorizedAt: row.authorized_at,
      bookingDate: row.booking_date,
      valueDate: row.value_date,
      description: row.description,
      bankDescription: row.bank_description,
      categoryId: row.category_id,
      payee: row.payee,
      settlementStatus: row.settlement_status,
      reconciliationState: row.reconciliation_state,
      reconciliationId: row.reconciliation_id,
      matchConfidence: row.match_confidence,
      balanceEffectApplied: row.balance_effect_applied === 1,
    };
  }
}
