import { z } from "zod";
import {
  DelayedTransactionService,
  type JsonValue,
  type LocalTransaction,
  type ManualTransactionInput,
  type TransactionDirection,
} from "./DelayedTransactionService";

export interface KipCategory {
  readonly id: string;
  readonly label: string;
  readonly aliases: readonly string[];
}

export interface KipTaxRule {
  readonly id: string;
  readonly label: string;
  readonly keywords: readonly string[];
  readonly rateBasisPoints: number;
}

export interface KipContext {
  readonly defaultCurrency: string;
  readonly today: string;
  readonly categories: readonly KipCategory[];
  readonly taxRules: readonly KipTaxRule[];
}

export interface KipModelInput {
  readonly text: string;
  readonly defaultCurrency: string;
  readonly today: string;
  readonly categories: readonly KipCategory[];
  readonly taxRules: readonly KipTaxRule[];
}

export interface KipStructuredModel {
  /**
   * The native model adapter must return an already-decoded JSON object.
   *
   * The adapter should use constrained JSON decoding internally. Returning a
   * string containing conversational text is intentionally unsupported.
   */
  parse(input: KipModelInput): Promise<unknown>;
}

export interface KipParseRequest {
  readonly accountId: string;
  readonly clientId: string;
  readonly text: string;
  readonly currency?: string;
  readonly occurredAt?: string;
  readonly metadata?: Record<string, string | number | boolean | null>;
}

export interface KipParsedTransaction {
  readonly amountMinor: number;
  readonly currency: string;
  readonly direction: TransactionDirection;
  readonly occurredAt: string;
  readonly description: string;
  readonly categoryId: string | null;
  readonly payee: string | null;
  readonly taxRuleId: string | null;
  readonly taxAmountMinor: number | null;
}

export interface KipQueuedTransaction {
  readonly transaction: LocalTransaction;
  readonly parsed: KipParsedTransaction;
  readonly usedModel: boolean;
}

const KipOutputSchema = z
  .object({
    amountMinor: z.number().int().positive(),
    currency: z.string().length(3),
    direction: z.enum(["debit", "credit"]),
    occurredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().trim().min(1).max(500),
    categoryId: z.string().nullable(),
    payee: z.string().trim().max(500).nullable(),
    taxRuleId: z.string().nullable(),
    taxAmountMinor: z.number().int().nonnegative().nullable(),
  })
  .strict();

type KipOutput = z.infer<typeof KipOutputSchema>;

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseCurrencySymbol(value: string | undefined): string | null {
  if (value === "€") return "EUR";
  if (value === "$") return "USD";
  if (value === "£") return "GBP";
  return null;
}

function parseMinorAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");
  const commaIndex = normalized.lastIndexOf(",");
  const dotIndex = normalized.lastIndexOf(".");
  const decimalIndex = Math.max(commaIndex, dotIndex);

  let whole = normalized;
  let fraction = "";

  if (decimalIndex >= 0) {
    const possibleFraction = normalized.slice(decimalIndex + 1);

    if (possibleFraction.length <= 2) {
      whole = normalized.slice(0, decimalIndex);
      fraction = possibleFraction.padEnd(2, "0");
    }
  }

  whole = whole.replace(/[.,]/g, "");

  const amountMinor = Number(whole) * 100 + (fraction.length > 0 ? Number(fraction) : 0);

  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    throw new Error("The amount is outside the supported range");
  }

  return amountMinor;
}

function shiftDate(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T00:00:00Z`);

  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid date: ${dateValue}`);
  }

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function extractDirection(text: string): TransactionDirection {
  const normalized = normalizeText(text);
  const creditWords = [
    "refund",
    "refunded",
    "cashback",
    "salary",
    "income",
    "received",
    "receive",
    "reembolso",
    "estorno",
    "salario",
    "entrada",
  ];

  return creditWords.some((word) => normalized.includes(word))
    ? "credit"
    : "debit";
}

function extractDate(text: string, today: string): string {
  const normalized = normalizeText(text);

  if (
    normalized.includes("yesterday") ||
    normalized.includes("ontem") ||
    normalized.includes("gestern")
  ) {
    return shiftDate(today, -1);
  }

  return today;
}

function extractAmount(
  text: string,
  fallbackCurrency: string,
): {
  readonly amountMinor: number;
  readonly currency: string;
  readonly match: RegExpExecArray;
} | null {
  const expression =
    /([€$£])?\s*(\d+(?:[.,]\d{1,3})?)\s*(€|\$|£|EUR|USD|GBP|BRL)?/i;
  const match = expression.exec(text);

  if (match === null) {
    return null;
  }

  const symbol = match[1] ?? match[3];
  const explicitCode = match[3]?.toUpperCase();
  const currency =
    parseCurrencySymbol(symbol) ??
    (explicitCode !== undefined && explicitCode.length === 3
      ? explicitCode
      : fallbackCurrency.toUpperCase());

  return {
    amountMinor: parseMinorAmount(match[2]),
    currency,
    match,
  };
}

function extractDescription(text: string, amountMatch: RegExpExecArray): string {
  const remainder = text
    .slice(0, amountMatch.index)
    .concat(" ", text.slice(amountMatch.index + amountMatch[0].length))
    .replace(
      /\b(spent|spend|paid|pay|purchase|bought|for|at|on|debit|credit)\b/gi,
      " ",
    )
    .replace(/[()[\]{}:;,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (remainder.length === 0) {
    throw new Error("Please include a merchant or description");
  }

  return remainder.slice(0, 500);
}

function tokenScore(left: string, right: string): number {
  const leftTokens = new Set(normalizeText(left).split(/\s+/).filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(/\s+/).filter(Boolean));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let shared = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  const jaccard = shared / union;
  const leftText = [...leftTokens].join("");
  const rightText = [...rightTokens].join("");
  const containment =
    leftText.includes(rightText) || rightText.includes(leftText) ? 1 : 0;

  return jaccard * 0.7 + containment * 0.3;
}

function inferCategory(
  description: string,
  categories: readonly KipCategory[],
): string | null {
  let bestCategory: KipCategory | null = null;
  let bestScore = 0;

  for (const category of categories) {
    const candidateText = [category.label, ...category.aliases].join(" ");
    const score = tokenScore(description, candidateText);

    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  return bestCategory !== null && bestScore >= 0.35 ? bestCategory.id : null;
}

function inferTaxRule(
  description: string,
  taxRules: readonly KipTaxRule[],
): KipTaxRule | null {
  const normalized = normalizeText(description);

  return (
    taxRules.find((rule) =>
      rule.keywords.some((keyword) => normalized.includes(normalizeText(keyword))),
    ) ?? null
  );
}

function calculateTax(amountMinor: number, rule: KipTaxRule | null): number | null {
  if (rule === null) {
    return null;
  }

  return Math.round((amountMinor * rule.rateBasisPoints) / 10_000);
}

function validateKnownIds(output: KipOutput, context: KipContext): KipOutput {
  if (
    output.categoryId !== null &&
    !context.categories.some((category) => category.id === output.categoryId)
  ) {
    throw new Error("Kip returned an unknown category ID");
  }

  if (
    output.taxRuleId !== null &&
    !context.taxRules.some((rule) => rule.id === output.taxRuleId)
  ) {
    throw new Error("Kip returned an unknown tax-rule ID");
  }

  return output;
}

export class KipOfflineEngine {
  public constructor(
    private readonly delayedTransactions: DelayedTransactionService,
    private readonly context: KipContext,
    private readonly model?: KipStructuredModel,
  ) {}

  public async parseAndQueue(
    request: KipParseRequest,
  ): Promise<KipQueuedTransaction> {
    const deterministic = this.parseDeterministically(
      request.text,
      request.currency?.toUpperCase() ?? this.context.defaultCurrency,
      request.occurredAt ?? this.context.today,
    );
    let parsed: KipParsedTransaction;
    let usedModel = false;

    if (deterministic !== null) {
      parsed = deterministic;
    } else {
      if (this.model === undefined) {
        throw new Error(
          "Kip could not determine the amount and no offline model is configured",
        );
      }

      const modelValue = await this.model.parse({
        text: request.text,
        defaultCurrency:
          request.currency?.toUpperCase() ?? this.context.defaultCurrency,
        today: request.occurredAt ?? this.context.today,
        categories: this.context.categories,
        taxRules: this.context.taxRules,
      });

      const parsedModel = KipOutputSchema.safeParse(modelValue);

      if (!parsedModel.success) {
        throw new Error(
          `Kip returned invalid structured output: ${parsedModel.error.message}`,
        );
      }

      const validated = validateKnownIds(parsedModel.data, this.context);

      parsed = {
        amountMinor: validated.amountMinor,
        currency: validated.currency.toUpperCase(),
        direction: validated.direction,
        occurredAt: validated.occurredAt,
        description: validated.description,
        categoryId: validated.categoryId,
        payee: validated.payee,
        taxRuleId: validated.taxRuleId,
        taxAmountMinor: validated.taxAmountMinor,
      };
      usedModel = true;
    }

    const queuedInput: ManualTransactionInput = {
      accountId: request.accountId,
      clientId: request.clientId,
      amountMinor: parsed.amountMinor,
      currency: parsed.currency,
      direction: parsed.direction,
      occurredAt: parsed.occurredAt,
      description: parsed.description,
      categoryId: parsed.categoryId,
      payee: parsed.payee,
      taxRuleId: parsed.taxRuleId,
      taxAmountMinor: parsed.taxAmountMinor,
      metadata: request.metadata as JsonValue | undefined,
    };

    const transaction = await this.delayedTransactions.queueManualTransaction(
      queuedInput,
    );

    return { transaction, parsed, usedModel };
  }

  private parseDeterministically(
    text: string,
    fallbackCurrency: string,
    today: string,
  ): KipParsedTransaction | null {
    const amount = extractAmount(text, fallbackCurrency);

    if (amount === null) {
      return null;
    }

    const description = extractDescription(text, amount.match);
    const occurredAt = extractDate(text, today);
    const direction = extractDirection(text);
    const categoryId = inferCategory(description, this.context.categories);
    const taxRule = inferTaxRule(description, this.context.taxRules);

    return {
      amountMinor: amount.amountMinor,
      currency: amount.currency,
      direction,
      occurredAt,
      description,
      categoryId,
      payee: null,
      taxRuleId: taxRule?.id ?? null,
      taxAmountMinor: calculateTax(amount.amountMinor, taxRule),
    };
  }
}
