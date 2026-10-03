# DACH Localization and Product Plan

## Purpose

Define the product and localization requirements for consumers and small
businesses in Austria, Germany, and Switzerland without hard-coding regional
accounting behavior into the mobile UI.

## Locale model

Support these regional interface choices:

- `de-AT` — Austrian German.
- `de-DE` — German German.
- `de-CH` — Swiss German conventions.
- `en` — fallback and international user option.

The existing web locale registry is in:

- `frontend/src/lib/i18n.ts`

Existing translations should be reused as the starting resource set. Missing
regional differences should fall back to common German keys until reviewed by a
native speaker.

Interface language, workspace locale, and accounting jurisdiction must remain
separate concepts.

## Workspace configuration

Use existing workspace fields as the source of behavior:

- Default currency.
- Locale.
- Timezone.
- Tax jurisdiction.
- Workspace kind.
- Enabled modules.

Do not infer accounting jurisdiction only from the phone's device locale.

## Currency and number formatting

Default expectations:

- Austria: EUR.
- Germany: EUR.
- Switzerland: CHF.

All amounts must use locale-aware formatting. The app must not hard-code decimal
separators, thousands separators, currency placement, or date order.

Use the workspace currency for financial records and the user display
preference for presentation when the backend supports both.

Review scenarios:

- EUR amounts in Germany and Austria.
- CHF amounts in Switzerland.
- A multi-currency workspace.
- Cross-currency transaction with FX fallback warning.
- Negative zero and rounding display.
- Large business amount and small Kip amount.

## Consumer requirements

Prioritize:

- Fast Kip entry.
- Clear current balance.
- Recent transactions.
- Bank connection status.
- Budgets and goals.
- Simple reconciliation questions.
- Understandable category and recurring-payment language.

Avoid exposing tax and invoice concepts by default in personal workspaces.

## Small-business requirements

Prioritize:

- Multiple business accounts.
- Cash flow.
- Receivables and payables.
- Invoices and invoice schedules.
- Supplier/payee records.
- Recurring operating costs.
- VAT/MWST context.
- Attachments and receipt evidence.
- Reports and exports.
- Workspace roles for owners, managers, editors, and viewers.

The UI should use the workspace module configuration to progressively reveal
these capabilities.

## Terminology review

Prepare a terminology table for approval covering:

- Revenue/income.
- Expense/cost.
- Transfer.
- Reconciliation/matching.
- Pending/settled/posted.
- VAT in Austria/Germany.
- MWST in Switzerland.
- Invoice/receipt.
- Supplier/payee.
- Account balance/available balance.

The same backend field may need different labels by jurisdiction or workspace
kind. Labels must not change the underlying data model.

## Tax and compliance boundary

The mobile UI may collect and display workspace tax settings, but it must not
pretend to provide legal or tax advice. Tax rules should be server-controlled,
versioned, and associated with the workspace jurisdiction.

Exports must preserve the backend's canonical amounts, dates, identifiers, and
document references.

## Accessibility and language quality

- Support Dynamic Type and Android font scaling.
- Avoid text embedded in images.
- Do not use color as the only status signal.
- Allow long German compound words without clipping.
- Test pluralization and gender-neutral labels where relevant.
- Make validation errors close to the relevant input.
- Review translations in real financial screens rather than isolated strings.

## Localization verification

Verify at minimum:

1. Login, onboarding, Kip, transactions, reconciliation, bank connections,
   and workspace switching in German and English.
2. EUR and CHF formatting in light and dark modes.
3. Dates and timezones around daylight-saving changes.
4. Long German labels on small iOS and Android screens.
5. Business terminology for each tax jurisdiction.
6. Fallback behavior when a regional translation key is missing.
