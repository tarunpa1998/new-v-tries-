# Kip Local AI and Delayed Bank Reconciliation Plan

## Purpose

Explain how Kip should capture a short text or voice prompt, turn it into a
safe transaction draft, categorize it on the user's device, and later connect
it to the bank transaction that may arrive two to four days afterward.

This document describes the intended behavior and technology choices. It does
not add application code.

## Approved baseline for the first Kip release

The first production slice should be intentionally smaller than the complete
four-pipeline concept:

1. Typed English and German prompts.
2. Deterministic extraction first.
3. Local Qwen model fallback only for incomplete or ambiguous prompts.
4. Strict validation and user confirmation.
5. SQLite local transaction storage.
6. Offline outbox and later cloud synchronization.
7. Delayed manual-to-bank reconciliation.

Voice, physical receipt scanning, Austrian receipt verification, and digital
invoice parsing remain later intake pipelines. They must use the same validated
transaction/document service instead of creating parallel ledger behavior.

## Kip product definition

Kip is the name of Logg's local AI transaction assistant. It is not only a
parser or background service. It is the visible assistant that the user opens
from the mobile application to record income and expenses quickly.

The first interaction should be typed text. Voice can use the same pipeline
later when on-device transcription is available.

## Kip launch experience

When the user is authenticated and inside a profile, the app should show a
floating Kip action in an easy right-hand thumb position. It should stay above
the bottom navigation and safe-area inset without covering important controls.

The action should:

- Have an accessible label such as “Open Kip”.
- Meet the platform touch target requirement.
- Use a consistent vector icon, not an emoji.
- Respect light/dark theme tokens.
- Remain available from Home and Transactions.
- Be hidden or replaced by a normal navigation action on screens where it would
  conflict with a form or destructive action.

When tapped:

1. iOS opens a native-feeling sheet.
2. Android opens a Material-style bottom sheet.
3. The sheet shows the active workspace, account, and currency.
4. The user types a short prompt.
5. Kip extracts a transaction draft locally.
6. The user reviews and confirms it.
7. The sheet closes or opens the saved transaction detail.

The active profile must be visible in the Kip sheet. The user should see
Personal, Family, or Business rather than needing to understand the internal
workspace implementation. This prevents a personal expense from being saved to
the Family or Business profile accidentally.

## Four intake pipelines and delivery order

| Pipeline | First-release status | Later technology direction |
| --- | --- | --- |
| Typed text chat | Build first | Deterministic parser plus local Qwen fallback |
| Voice/audio | Defer until text is stable | On-device Apple/Android speech or Whisper benchmark |
| Physical receipts | Defer | Native camera, on-device OCR, optional verified fiscal QR path |
| Digital invoices | Defer | Document picker, PDF text extraction, OCR fallback, Kip extraction |

All four pipelines should eventually produce the same reviewable structured
draft. None of them should write directly to the ledger without the common
validation, confirmation, persistence, and synchronization stages.

## Main design decision: deterministic first, local AI second

Kip should not send every small prompt to a large language model. Most prompts
contain simple financial facts that are more reliably extracted with ordinary
local parsing:

- Amount.
- Currency.
- Debit or credit direction.
- Today/yesterday/date.
- Merchant or payee text.
- Known category alias.
- Known workspace rule.

The pipeline should therefore be:

1. Deterministic parser.
2. Local category aliases and user corrections.
3. Workspace rules and merchant/payee mappings.
4. Small on-device AI model only when information is incomplete or ambiguous.
5. Strict validation.
6. User confirmation.
7. Local transaction creation and background synchronization.

This makes simple prompts fast, private, battery-friendly, and available even on
devices that cannot run a larger local model.

## Recommended mobile technology stack

### Mobile frontend

- React Native with Expo development builds.
- One shared application producing iOS and Android builds.
- Expo Router for navigation.
- TanStack Query for server/cache coordination.
- SQLite for the offline ledger and outbox.
- Secure native storage for access tokens and sensitive session data.
- Shared TypeScript packages for API contracts, core utilities, and Kip types.

Expo Go should not be treated as the final runtime because local model
inference, SQLite configuration, secure storage, speech recognition, and other
native integrations require a development build or prebuilt native projects.

### Voice capture

Voice input should use platform-native speech recognition where an on-device
language model is available:

- iOS: Apple Speech framework with on-device recognition requested.
- Android: Android `SpeechRecognizer` with offline/on-device recognition
  preferred when supported.

The app must detect when offline speech recognition is unavailable. In that
case, it should offer typed input instead of silently uploading financial audio
to a cloud provider.

The raw audio should not be stored after transcription unless the user
explicitly chooses to attach it.

### Local language model runtime

The recommended first local AI runtime is:

- A small quantized instruction model in GGUF format.
- `llama.cpp` as the shared native inference core.
- Metal acceleration on iOS where supported.
- Vulkan acceleration on Android where supported.
- CPU fallback for compatible lower-end devices.
- A small native bridge exposed to the React Native Kip adapter.

This choice gives one model/inference abstraction across both platforms while
still using each platform's hardware acceleration. The exact model must be
selected only after benchmarking supported iOS and Android devices, checking
its license, and testing German/English financial phrases.

`llama.rn` should be treated as a native integration spike because its current
package line is a release candidate. If it does not meet the selected Expo and
React Native build requirements, the same Kip model adapter should be backed by
a small custom native bridge around the selected `llama.cpp` version.

### First model candidate for English and German

The first model to benchmark should be a small multilingual instruct model such
as a quantized `Qwen2.5-1.5B-Instruct` GGUF variant. It is a candidate, not a
final locked dependency. A smaller `Qwen2.5-0.5B-Instruct` variant can be
benchmarked for lower-memory phones, while a larger model should be considered
only if the smaller variants cannot reliably understand German, English,
misspellings, and short financial phrases.

The model decision must verify:

- English extraction accuracy.
- German extraction accuracy.
- EUR, CHF, and USD recognition.
- Decimal comma and decimal point behavior.
- Short incomplete prompts.
- Common spelling mistakes.
- Category suggestion accuracy.
- Structured-output reliability.
- Memory and battery use on supported iOS and Android devices.
- Model and quantization licenses.

The model is not responsible for deciding whether a transaction is financially
valid. It only proposes structured fields. The application parser, workspace
category list, validation layer, user confirmation, and backend rules remain
authoritative.

Do not promise a fixed inference latency or RAM number before measuring on the
supported device matrix. Quantization, model context, native backend, thermal
state, and device memory all affect performance.

## Local persistence technology decision

The existing delayed-transaction design intentionally uses a SQLite adapter.
For the first mobile implementation:

1. Benchmark the official Expo SQLite path first because it has the simplest
   Expo integration.
2. Keep the adapter boundary so `@op-engineering/op-sqlite` can be evaluated
   for higher-throughput workloads later.
3. Do not choose both database bindings in the first release.
4. Keep amounts in integer minor units and keep the outbox/reconciliation work
   inside database transactions.

The database choice must be made by measured startup, query, migration,
background-sync, and battery behavior rather than a stated 1–2 ms query claim.

## Receipt and invoice boundaries

### Austrian fiscal QR path

An Austrian RKSV QR code may become a fast extraction and verification path, but
the app must not assume that every receipt has the same QR format or that
decoding a QR code alone proves legal compliance.

Before implementation, verify with official RKSV documentation and an Austrian
tax/compliance specialist:

- Which receipt formats and QR payloads are supported.
- Signature and certificate-chain verification requirements.
- Tax-rate and payment-type fields.
- Required preservation of the original receipt.
- Retention and export obligations.

The QR path must be marked as “unverified extraction” until cryptographic and
legal verification are complete. Camera decode speed and accuracy must be
measured instead of assumed.

### Physical receipt OCR

The later receipt pipeline may use:

- Native camera or document capture.
- On-device ML Kit on Android where compatible.
- Apple Vision on iOS where compatible.
- Local Kip structured extraction after OCR.

Vision Camera should be added only if live frame scanning or advanced document
capture requires it. A one-shot document capture can begin with a simpler native
camera/document-picker path.

### Digital invoice extraction

`expo-document-picker` can select a PDF, but `pdf-lib` should not be treated as
the PDF text-extraction engine. The implementation must distinguish:

- Text-based PDFs.
- Scanned/image PDFs.
- Password-protected PDFs.
- Corrupt or unsupported PDFs.

Use a tested PDF text extractor for text PDFs and OCR for scanned PDFs. The
existing web use of `pdfjs-dist` should be evaluated before adding another PDF
library to the mobile bundle.

AI must never invent BMD/RZL account codes. Accounting mappings must come from
the workspace chart of accounts, jurisdiction, and user-approved configuration.

### Document archive and compliance

A SHA-256 hash is useful for detecting changes, but a hash by itself is not a
tamper-proof legal archive. A future document service must also define:

- Original-file preservation.
- Immutable or append-only storage.
- Audit events and timestamps.
- Encryption and access control.
- Backup/recovery.
- Retention and export behavior.
- Legal-hold and deletion behavior.

The product must not claim Austrian tax compliance solely from local hashing or
receipt QR decoding.

## Fine-tuning boundary

Do not fine-tune Kip before the base-model and deterministic pipeline are
benchmarked.

The first evaluation set should contain reviewed English and German examples,
including:

- Short incomplete phrases.
- German regional wording.
- Misspellings.
- EUR, CHF, and USD.
- Decimal comma and decimal point.
- Income and expenses.
- Category ambiguity.
- Personal and business workspace context.

Synthetic data may expand coverage, but it must not be treated as proof of
accuracy. If fine-tuning becomes necessary, LoRA/Unsloth can be evaluated after
the failure patterns are known, the dataset is reviewed, and the model/license
pipeline is reproducible.

### Model size recommendation

Start with a small instruction model in approximately the 0.5B–1.5B parameter
range and a 4-bit quantized variant. A larger model should be considered only
for devices with sufficient memory and only if the smaller model cannot extract
the required fields reliably.

The model should be an optional signed download rather than part of the base
application bundle when its size would materially affect installation.

Devices that cannot download or run the model must still support deterministic
Kip parsing and a normal transaction form.

### Alternative runtimes to evaluate later

These are alternatives, not simultaneous first-release dependencies:

| Runtime | Strength | Reason to defer or evaluate |
| --- | --- | --- |
| Apple Core ML plus Android LiteRT | Strong platform-native acceleration | Requires two model conversion and behavior paths |
| ExecuTorch | Mobile-focused PyTorch deployment | Requires model conversion and native integration work |
| MediaPipe/LiteRT text model | Good for focused classifiers or entity extraction | Less flexible for a natural-language fallback model |
| Cloud LLM | Strongest language flexibility | Privacy, network, cost, latency, and financial-data concerns |

The first implementation should keep these behind the same Kip model adapter so
the model runtime can change without changing the transaction workflow.

## Local AI privacy rules

By default:

- Typed prompts remain on the phone.
- Voice transcription remains on the phone when on-device recognition is
  available.
- The local model receives only the minimum context needed for extraction.
- Bank credentials are never exposed to the model.
- Access tokens are never exposed to the model.
- Full bank history is not placed in the prompt.
- Model prompts and outputs are not sent to a server.
- Sensitive prompt text is not written to analytics or crash logs.

A future cloud fallback may be offered only as an explicit user setting with
clear consent, redaction, and a visible explanation. It must not be silently
used when the local model fails.

## Kip capture flow

### Step 1 — User input

The user can:

- Type a short phrase.
- Speak a short phrase.
- Use the full transaction form when the phrase is incomplete.

The normal entry point is the floating Kip button described above. The full
transaction form remains available for users who prefer explicit entry or when
the device cannot run the local model.

Examples:

- “30 dollars out with friends.”
- “30 dollars groceries.”
- “30 Euro bei Billa.”
- “Yesterday 18 CHF lunch.”
- “Received 500 EUR salary.”

### Step 2 — Normalize locally

Normalize without changing meaning:

- Trim and normalize whitespace.
- Normalize Unicode accents for matching while preserving the original text.
- Recognize currency symbols and currency codes.
- Recognize localized decimal separators.
- Recognize common date words in enabled languages.
- Detect credit words such as salary, refund, received, or cashback.
- Preserve the original phrase for the user's review.

### Step 3 — Extract deterministic fields

The deterministic parser should attempt:

| Field | Example result |
| --- | --- |
| Amount | 30.00 |
| Minor-unit amount | 3000 cents |
| Currency | USD, EUR, or CHF |
| Direction | Debit or credit |
| Date | Today or an explicitly mentioned date |
| Description | Friends, groceries, Billa, lunch |
| Payee | Known person or merchant if identifiable |
| Category candidate | From aliases/rules when available |

The amount must be stored as integer minor units, not a floating-point balance
value.

### Step 4 — Apply local context

The app should rank categories in this order:

1. An explicit category selected by the user.
2. A matching personal correction from the user's local history.
3. A workspace rule.
4. A known merchant/payee alias.
5. Deterministic keyword/category alias matching.
6. Local AI suggestion.
7. Uncategorised state requiring later selection.

This lets the product improve from user corrections without training a model on
the user's data or uploading their prompts.

### Step 5 — Use local AI only when needed

The local model should receive:

- Original prompt.
- Default workspace currency.
- Current local date.
- Small list of valid categories and aliases.
- Relevant tax-rule labels when the business module is enabled.
- A strict extraction instruction.

It should return only structured fields that the app can validate. It must not
be allowed to create a transaction, invent a category ID, invent a tax rule,
or call the backend.

### Step 6 — Validate and confirm

The output must be checked for:

- Positive safe amount.
- Supported three-letter currency code.
- Valid debit/credit direction.
- Valid ISO date.
- Description length.
- Category ID belonging to the locally loaded workspace.
- Tax-rule ID belonging to the workspace, when present.
- Tax amount consistent with the selected rule, when applicable.

The model can fill the form, but the user should confirm the transaction before
it becomes an intentional local entry. High confidence should mean “pre-filled
and easy to confirm,” not “silently recorded.”

## Example: “30 dollars out with friends”

Expected behavior:

1. Detect amount 30.00.
2. Detect USD or use the workspace currency if no currency was stated.
3. Detect a debit/expense.
4. Preserve “with friends” as the description.
5. Suggest a social/friends category only if the workspace has a matching
   category or the user's history supports it.
6. Show the user the amount, date, account, description, and category.
7. Let the user confirm or correct the category.
8. Create a local pending-settlement transaction after confirmation.

The app must not guess a specific category with certainty if the workspace does
not contain enough evidence.

## Example: “30 dollars groceries” or misspelled groceries

Expected behavior:

1. Detect amount 30.00 and currency.
2. Detect a debit/expense.
3. Normalize the spelling and compare it with local category aliases.
4. Suggest the workspace's Groceries category if it exists.
5. Use local AI only if deterministic matching cannot resolve the phrase.
6. Show the suggested category for confirmation.
7. Store the correction if the user chooses another category, subject to the
   user's privacy settings.

## What Kip creates locally

After confirmation, Kip creates a local transaction record with:

- A device-generated client ID.
- Workspace ID.
- Account ID.
- Amount and currency.
- Debit/credit direction.
- Occurred date.
- Original user phrase.
- Parsed description/payee.
- Category and tax-rule IDs when confirmed.
- A pending-settlement status.
- A balance-effect-applied marker.
- An outbox mutation waiting for synchronization.

The local transaction immediately affects the user's projected balance once. It
is not yet treated as a confirmed bank observation.

## Delayed bank transaction problem

Example:

1. Monday: the user says “30 dollars groceries.”
2. Monday: Kip creates a local manual transaction and updates the balance.
3. Thursday: the bank reports a 30-dollar grocery transaction.
4. The app must connect the two records rather than showing a duplicate 60-dollar
   expense.

The bank may also report:

- A pending record first and a posted record later.
- A different booking date than the purchase date.
- A slightly different amount because of a tip, fee, or exchange rate.
- A changed provider identifier.
- A merchant description different from the user's wording.

## Matching model

The bank observation and the manual entry should be represented separately until
the matching decision is made.

### Candidate evidence

Compare:

- Same workspace.
- Same account.
- Debit/credit direction.
- Exact amount or configured minor-unit tolerance.
- Percentage amount tolerance for currency/provider adjustments.
- Purchase/authorization date.
- Booking/value date.
- Allowed date window, normally several days and up to the configured maximum.
- Normalized merchant/payee text.
- Known payee aliases.
- Currency.
- Existing pending-to-posted provider identity.
- Whether another manual row already claimed the bank observation.

### Confidence levels

#### High-confidence automatic link

Use only when:

- Same account.
- Strong amount agreement.
- Compatible direction and currency.
- Date inside the automatic window.
- Strong merchant or description evidence.
- Candidate is clearly better than every alternative.

The current planning artifacts use a target score around 0.92 with a margin over
the next candidate. The exact threshold must be tested with real anonymized
transaction examples before release.

#### Confirmation candidate

Show the user a question when:

- Amount is close but not exact.
- Date drift is larger.
- Merchant descriptions are similar but not identical.
- Multiple possible bank rows exist.
- The bank changes a pending record into a posted record.

The confirmation should show evidence:

- Manual description.
- Bank description.
- Manual amount and bank amount.
- Purchase and booking dates.
- Account.
- Category.

Actions should be:

- Link/confirm.
- Keep separate.
- Edit manual transaction.
- Mark manual-only.
- Mark bank-only where appropriate.

#### No viable match

Keep the rows distinct:

- Manual entry becomes `manual_only` if the user confirms it is not a bank
  transaction or if it remains unresolved after the configured review period.
- Bank observation becomes `bank_only` when it has no matching manual entry.

The app must never silently delete either record.

## Merge behavior

“Merge” should mean link and materialize one canonical financial transaction,
not destroy the original evidence.

### Preserve bank-authoritative fields

- Provider.
- External bank ID.
- Actual bank amount.
- Currency reported by the bank.
- Authorization/purchase date.
- Booking date.
- Value date.
- Pending/posted state.
- Raw provider data.

### Preserve user-authoritative fields

- User category.
- User payee correction.
- User description or note.
- User tags.
- User-confirmed tax treatment.
- Original Kip phrase.

### Preserve derived fields

- Reconciliation ID.
- Match confidence.
- Match method.
- Settlement status.
- Balance-effect state.
- Reconciliation history events.

The web and mobile applications should display the linked result as one normal
transaction with a visible indication that it was captured manually and later
settled by the bank. The original manual and bank observations remain available
in detail/history views.

## Balance handling

Balance integrity is the most important part of delayed matching.

### At manual capture

- Apply the manual amount once to the local projected balance.
- Mark that the balance effect was applied.
- Do not also apply a bank amount that is merely a candidate observation.

### At a successful link

- Reverse or retire the manual placeholder effect.
- Apply the canonical bank effect exactly once.
- If amounts are equal, the visible balance should not jump.
- If the bank amount differs, apply only the difference and show the reason.
- Mark the reconciliation event and balance state in the local database.

### At an ambiguous candidate

- Keep the existing projected manual effect.
- Do not apply the bank row a second time.
- Wait for the user decision.

### At keep-separate/manual-only

- Preserve the user's explicit decision.
- Apply each record only according to its actual financial meaning.
- Never use a hidden merge or deletion to make the balance appear correct.

## Pending-to-posted bank lifecycle

If the bank first sends a pending transaction and later sends the posted
transaction:

1. Match the provider's stable external identity when available.
2. Update the same bank observation/canonical record.
3. Preserve booking/value dates when they become available.
4. Re-run manual-link scoring only when material fields change.
5. Do not create a second bank expense.

If the provider changes its identifier, use the provider's stable fields and
recent-history safeguards, then create a candidate rather than blindly creating
a duplicate.

## Timing and unmatched records

The normal bank delay may be two to four days, but provider behavior varies.
The matcher should search a wider recent window than the automatic confidence
window.

Recommended behavior:

- Automatic matching window: narrow and conservative.
- Confirmation search window: wider, such as up to seven days by default.
- Review reminder: after a configurable number of days.
- Manual-only decision: available immediately when the user knows it was cash
  or a non-bank expense.
- No automatic deletion after timeout.

The exact values must be configurable by workspace/provider evidence and tested
against the existing fourteen-day provider sync rewind behavior.

## Server synchronization

When the device reconnects:

1. Upload the confirmed manual entry with its client ID.
2. The backend deduplicates a replayed client ID.
3. The backend stores/observes the bank transaction using provider identity.
4. The backend runs the same reconciliation policy used by web sync.
5. The server returns the canonical transaction, link state, confidence, and
   any confirmation candidate.
6. The mobile database applies the response transactionally.
7. The web app sees the same canonical result on its next query/sync.

The local matcher may provide immediate UI feedback, but the server must resolve
cross-device conflicts and remain authoritative.

## Category behavior after bank settlement

When the manual record has a confirmed category:

- Keep that category when the bank row is linked unless the user explicitly
  chooses the bank/rule category.
- Run normal backend categorization rules only when they do not overwrite an
  explicit user choice.
- Preserve both the original Kip phrase and normalized bank description.
- If the user changes the category after linking, record the change normally and
  allow existing rules to learn only through the approved rule workflow.

## Failure and edge cases

The plan must cover:

- Two identical manual entries and two identical bank rows.
- One manual entry matching a pending then posted bank row.
- A bank amount changing after first observation.
- Currency conversion or FX fallback.
- A tip or fee causing a small difference.
- Same merchant on the same day with multiple amounts.
- Manual entry on the wrong account.
- Bank transaction arriving before the mobile outbox is uploaded.
- App termination during matching.
- User declining a candidate.
- User changing a category before settlement.
- Bank transaction never arriving.
- Two devices creating the same manual entry.
- Web and mobile editing the same record.

## Recommended implementation order

1. Deterministic Kip extraction and confirmation UI.
2. Local category aliases and correction history.
3. Local SQLite pending-settlement record.
4. Idempotent outbox synchronization.
5. Bank observation storage and provider identity handling.
6. Server-side manual-bank reconciliation service.
7. Automatic high-confidence links.
8. Confirmation queue.
9. Balance delta and audit-event handling.
10. Optional on-device local model fallback.
11. Optional on-device speech capture.

The local model should not delay the first reliable Kip release. It improves
ambiguous language after deterministic parsing, categories, and reconciliation
are already safe.

## Verification requirements

Before release, demonstrate:

- “30 dollars groceries” creates the expected draft.
- Misspelled groceries can use aliases or local model assistance.
- A prompt with no amount asks for the missing amount.
- A prompt with an unknown category remains reviewable.
- No prompt or voice audio leaves the device by default.
- The local model cannot invent category IDs.
- Manual plus matching bank transaction affects the balance once.
- Manual plus changed bank amount applies only the delta.
- Pending-to-posted bank updates do not duplicate the transaction.
- Ambiguous matches appear in the confirmation queue.
- Declined matches remain separate and are not repeatedly suggested.
- The same result appears in web and mobile after synchronization.
- Unmatched manual and bank rows remain visible and explainable.
