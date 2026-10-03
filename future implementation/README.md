# Future Implementation Plans

This directory is now the planning area for the proposed iOS and Android Logg
applications. No new application code is being added during this planning
stage. Implementation should begin only after these plans have been reviewed
and approved.

Any AI agent or developer working from this directory must follow
`AI_AGENT_IMPLEMENTATION_RULES.md` before making a plan or code change.

The existing backend and web frontend are the reference implementations. The
plans define how mobile will consume them, what must be extracted into shared
packages, which backend capabilities are additive, and how the mobile design
system can be changed globally without editing every screen.

## Application source locations

The instruction to edit only `future implementation/` applies to planning work.
After explicit implementation approval, production code belongs in the app and
shared-package directories, not in this planning directory:

```text
apps/mobile/                  One Expo app for iOS and Android
  src/app/                    Routes and navigation entry points
  src/features/kip/           Kip UI and on-device integration
  src/features/<feature>/    Other mobile feature modules
  src/components/            Reusable native components
  src/theme/index.ts         Global theme public entry
packages/api/                 Shared API contracts/client logic
packages/core/src/kip/        Reusable pure Kip parsing/validation helpers
packages/i18n/                Shared locale resources
packages/design-tokens/       Shared semantic design tokens
frontend/                     Existing web app
backend/                      Existing backend
future implementation/        Plans, progress, and draft references
```

Use lowercase `apps/`. Do not create separate iOS/Android screen codebases or a
root `kip/` service for the local assistant. Expo-generated native projects, when
present, live inside `apps/mobile/ios/` and `apps/mobile/android/`.

## Contents

| File | Purpose |
| --- | --- |
| `SECuro_LOGG_ARCHITECTURE_REVIEW.md` | Consolidated repository review and executive findings |
| `BANK_SYNC_AND_TRANSACTION_LIFECYCLE.md` | Provider synchronization, schemas, dates, idempotency, and lifecycle details |
| `RECONCILIATION_AND_RULES.md` | Existing matching, transfer, invoice, recurring, split, and categorization logic |
| `BACKEND_IMPLEMENTATION_PLAN.md` | Migration, model, service, API, and rollout recommendations |
| `IMPLEMENTATION_CHECKLIST.md` | Ordered implementation and verification checklist |
| `AI_AGENT_IMPLEMENTATION_RULES.md` | Mandatory cross-agent rules for architecture, design consistency, profiles, Kip, parity, and validation |
| `mobile/SQLITE_SCHEMA.sql` | Proposed local SQLite schema for the mobile ledger |
| `mobile/DelayedTransactionService.ts` | Offline manual-entry and bank-feed reconciliation service |
| `mobile/KipOfflineEngine.ts` | Deterministic/offline Kip transaction parser and queue integration |
| `FRONTEND_INTEGRATION_PLAN.md` | How the existing React frontend is reused safely by mobile |
| `MOBILE_FRONTEND_FEATURE_PORTING_PLAN.md` | Web feature inventory, parity levels, mobile navigation, and porting order |
| `KIP_LOCAL_AI_AND_DELAYED_RECONCILIATION_PLAN.md` | Approved first Kip slice, local AI stack, phased intake pipelines, delayed bank matching, and compliance boundaries |
| `WORKSPACE_SUBSCRIPTION_AND_PERSONAL_BUSINESS_PLAN.md` | One account, Personal/Family/Business profiles, subscriptions, entitlements, and isolation |
| `BACKEND_MOBILE_API_PLAN.md` | Backend contract, sync, auth, OAuth, security, and migration plan |
| `IOS_ANDROID_APP_PLAN.md` | Shared Expo app, navigation, feature modules, and native platform plan |
| `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md` | V1 UI stack, typography, cold start, profile picker, and profile transition behavior |
| `V1_BUILD_PLAN.md` | Step-by-step V1 build order, native design quality, current web parity, and Kip coverage |
| `MOBILE_DESIGN_SYSTEM_PLAN.md` | Global theme index, typography, color, component tokens, and dark/light strategy |
| `DACH_LOCALIZATION_AND_PRODUCT_PLAN.md` | Austria, Germany, Switzerland, consumer, and small-business requirements |
| `IMPLEMENTATION_SEQUENCE.md` | Dependency-ordered phases, approval gates, and verification plan |
| `APPROVAL_CHECKLIST.md` | Decisions to confirm before implementation begins |
| `GITHUB_ISSUES_HANDOFF.md` | GitHub publication instructions, complete backlog index, and Antigravity handoff prompt |
| `GITHUB_ISSUES_MANIFEST.json` | 51 ready-to-publish issue definitions with scope, dependencies, acceptance criteria, and URL mapping |
| `NEW_CHAT_IMPLEMENTATION_PROMPT.md` | Copyable build prompt with explicit implementation authorization, verified issue closure, and persistent progress tracking |

## GitHub backlog publication

The requested repository is `tarunpa1998/logg-main`. The local issue manifest is
prepared but has not been published: this folder has no Git metadata and the
GitHub CLI is unavailable in the current execution environment. Use
`GITHUB_ISSUES_HANDOFF.md` to create/reuse issues and push the intended planning
files from an authenticated checkout.

The backlog has one V1 epic, 43 V1 tasks, and seven post-V1 tasks. English and
German are mandatory for V1. After each meaningful implementation task, agents
must update the status, checklist, and evidence log under this directory.

During authorized implementation, complete and verify an issue, publish its
changes/evidence, update progress, close the actual GitHub issue as completed,
verify closure, and update the V1 epic before moving to the next unblocked task.
Partial or blocked work stays open. See section 16 G of the agent rules.

Use the fenced prompt in `NEW_CHAT_IMPLEMENTATION_PROMPT.md` to start building in
a new chat. The prompt explicitly authorizes implementation and task-scoped
commits/normal pushes; writing this prompt does not itself start implementation
or publish/close any issues in the current chat.

## Repository assumptions

These artifacts are recommendations for the current repository. The mobile app
is not yet implemented in the repository; `LOGG_MOBILE_IMPLEMENTATION.md` is a
historical detailed specification whose separate iOS/Android-root decision must
be reconciled with the approved architecture before implementation. The
existing backend and web frontend remain the authoritative implementation
references.

## Recommended reading order

1. `AI_AGENT_IMPLEMENTATION_RULES.md`
2. `SECuro_LOGG_ARCHITECTURE_REVIEW.md`
3. `FRONTEND_INTEGRATION_PLAN.md`
4. `MOBILE_FRONTEND_FEATURE_PORTING_PLAN.md`
5. `KIP_LOCAL_AI_AND_DELAYED_RECONCILIATION_PLAN.md`
6. `WORKSPACE_SUBSCRIPTION_AND_PERSONAL_BUSINESS_PLAN.md`
7. `BACKEND_MOBILE_API_PLAN.md`
8. `IOS_ANDROID_APP_PLAN.md`
9. `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`
10. `V1_BUILD_PLAN.md`
11. `MOBILE_DESIGN_SYSTEM_PLAN.md`
12. `DACH_LOCALIZATION_AND_PRODUCT_PLAN.md`
13. `IMPLEMENTATION_SEQUENCE.md`
14. `APPROVAL_CHECKLIST.md`
15. `BANK_SYNC_AND_TRANSACTION_LIFECYCLE.md`
16. `RECONCILIATION_AND_RULES.md`
17. `BACKEND_IMPLEMENTATION_PLAN.md`
18. `mobile/SQLITE_SCHEMA.sql`
19. `mobile/DelayedTransactionService.ts`
20. `mobile/KipOfflineEngine.ts`
21. `IMPLEMENTATION_CHECKLIST.md`
