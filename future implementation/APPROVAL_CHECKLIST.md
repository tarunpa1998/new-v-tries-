# Approval Checklist Before Implementation

Please review and approve or revise each item before application code is added.

- [ ] All implementation agents must follow
      `AI_AGENT_IMPLEMENTATION_RULES.md`.

## Architecture

- [ ] Use one Expo/React Native application for both iOS and Android.
- [ ] Keep platform-specific configuration and native adapters inside that app.
- [ ] Reuse API contracts, pure utilities, locale resources, and semantic tokens.
- [ ] Rebuild UI natively rather than importing web React/Tailwind components.
- [ ] Keep bank providers and credentials exclusively in the backend.

## Frontend integration

- [ ] Extract API contracts from `frontend/src/lib/api.ts` and
      `frontend/src/types/index.ts` incrementally.
- [ ] Keep browser storage and redirects in a web adapter.
- [ ] Use secure native storage and native auth navigation on mobile.
- [ ] Preserve all existing web behavior during migration.

## Backend integration

- [ ] Reuse current auth, workspace, account, transaction, connection, and
      reconciliation routes first.
- [ ] Approve additive bootstrap/sync endpoints for offline-first behavior.
- [ ] Approve mobile OAuth/deep-link redirect support.
- [ ] Require idempotency and workspace isolation for all offline mutations.

## Mobile product scope

- [ ] Build Personal, Family, and Business experiences in one app using
      isolated profiles and enabled modules.
- [ ] Use one login with a default Personal profile, optional Family profile,
      and optional Business profile(s).
- [ ] Keep Personal, Family, and Business financial data isolated.
- [ ] Put Shared Expenses inside the Family profile rather than creating a
      second independent ledger.
- [ ] Allow a user to hold personal/family and business entitlements together.
- [ ] Show the active profile inside the Kip capture sheet before saving.
- [ ] Make Kip available offline.
- [ ] Include reconciliation in the first mobile transaction workflow.
- [ ] Treat bank synchronization as backend-owned.

## Kip product behavior

- [ ] Kip is the named local AI assistant, not only an invisible parser.
- [ ] Open Kip from a right-hand thumb-friendly floating action.
- [ ] Use a native-feeling sheet on iOS and a Material-style bottom sheet on
      Android.
- [ ] Start with typed English/German prompts.
- [ ] Use deterministic parsing before invoking a local model.
- [ ] Benchmark a small multilingual quantized model before locking the model.
- [ ] Keep local prompts and transaction drafts offline by default.
- [ ] Use Qwen2.5-1.5B-Instruct Q4 GGUF as the primary benchmark candidate.
- [ ] Keep Qwen2.5-0.5B-Instruct as the lower-memory fallback candidate.
- [ ] Treat `llama.rn` as a native integration spike until Expo/device testing
      proves it suitable for production.
- [ ] Defer voice, receipt OCR, RKSV verification, and digital invoices until
      typed Kip plus offline sync and delayed bank reconciliation are stable.

## Global design system

- [ ] Create one global mobile theme index before building full screens.
- [ ] Put all colors, typography, spacing, radii, borders, elevations, motion,
      icons, component variants, and financial statuses behind that index.
- [ ] Support system, light, and dark themes.
- [ ] Keep raw colors and arbitrary typography out of screen files.
- [ ] Use platform adapters for iOS and Android differences.
- [ ] Use React Native core plus focused libraries rather than one monolithic UI
      kit.
- [ ] Use SF Pro/San Francisco on iOS and Roboto on Android for V1.
- [ ] Keep font roles configurable for a later branded-font decision.
- [ ] Use the V1 cold-start/profile-picker flow from
      `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`.

## Typography decision

- [ ] System fonts first.
- [ ] Geist-like brand font.
- [ ] IBM Plex Sans.
- [ ] Nunito-style approachable font.
- [ ] Other choice: ______________________________

## Color decision

- [ ] Neutral + blue.
- [ ] Neutral + emerald.
- [ ] Neutral + indigo aligned with web.
- [ ] Warm neutral + blue/green.
- [ ] Other choice: ______________________________

The final choice should be reviewed on a personal dashboard, business
dashboard, transaction list, Kip form, and reconciliation state in both light
and dark mode.

## Regional scope

- [ ] `de-AT`.
- [ ] `de-DE`.
- [ ] `de-CH`.
- [ ] English fallback.
- [ ] EUR and CHF formatting.
- [ ] Workspace-based tax jurisdiction and currency behavior.

## First implementation slice

Choose the first vertical slice:

- [ ] Authentication → workspace → accounts → transactions.
- [ ] Authentication → workspace → Kip offline entry.
- [ ] Authentication → bank connection → synced transactions.
- [ ] Authentication → reconciliation queue.

Notes:

______________________________________________________________________________

______________________________________________________________________________
