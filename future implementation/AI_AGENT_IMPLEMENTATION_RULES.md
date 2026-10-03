# AI Agent Implementation Rules for Logg Mobile

## 0. Purpose and scope

This document is the implementation contract for any AI agent working on Logg
mobile or its supporting shared packages. It applies to:

- OmniRush AI.
- Claude.
- Antigravity.
- OpenCode agents.
- Human developers using AI assistance.
- Any future automated coding agent.

The agent must follow these rules before planning, editing, or validating mobile
work. The rules are tool-agnostic and do not depend on a particular model
provider.

The goal is to ensure that Logg remains:

- Native-feeling on iOS.
- Native-feeling on Android.
- Visually consistent across the entire product.
- Financially safe and auditable.
- Compatible with the existing web frontend and backend.
- Organized according to the approved `future implementation/` plans.

This file contains process and implementation rules. It does not add application
code.

## 1. Mandatory preflight

Before an agent makes a change, it must:

1. Identify whether the request is planning, documentation, frontend, backend,
   mobile, or release work.
2. Read this file completely enough to apply the relevant rules.
3. Read `future implementation/README.md`.
4. Read the plan that directly covers the requested feature.
5. Read `future implementation/V1_BUILD_PLAN.md` for V1 work.
6. Read `future implementation/IMPLEMENTATION_SEQUENCE.md` for dependencies.
7. Read `future implementation/APPROVAL_CHECKLIST.md` for unresolved decisions.
8. Inspect the existing web/backend implementation before inventing a new
   route, type, workflow, or permission rule.
9. Check whether the requested work has user approval.
10. State any plan conflict before editing.

If `IMPLEMENTATION_STATUS.md` or `IMPLEMENTATION_LOG.md` exists under this
directory, read it before selecting the next task. When GitHub issues are used,
read the current issue and its actual dependency links as well; backlog IDs such
as M01 are not GitHub issue numbers.

The mandatory V1 reading order is:

1. `AI_AGENT_IMPLEMENTATION_RULES.md`
2. `README.md`
3. `V1_BUILD_PLAN.md`
4. `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`
5. `MOBILE_DESIGN_SYSTEM_PLAN.md`
6. `IOS_ANDROID_APP_PLAN.md`
7. `MOBILE_FRONTEND_FEATURE_PORTING_PLAN.md`
8. `KIP_LOCAL_AI_AND_DELAYED_RECONCILIATION_PLAN.md`
9. `WORKSPACE_SUBSCRIPTION_AND_PERSONAL_BUSINESS_PLAN.md`
10. `BACKEND_MOBILE_API_PLAN.md`
11. `IMPLEMENTATION_SEQUENCE.md`
12. `IMPLEMENTATION_CHECKLIST.md`

Then read feature-specific research files as required:

- `BANK_SYNC_AND_TRANSACTION_LIFECYCLE.md`
- `RECONCILIATION_AND_RULES.md`
- `BACKEND_IMPLEMENTATION_PLAN.md`
- `mobile/SQLITE_SCHEMA.sql`
- `mobile/DelayedTransactionService.ts`
- `mobile/KipOfflineEngine.ts`

## 2. Authority and conflict resolution

When documents conflict, use this order:

1. Explicit user instruction in the current task.
2. Approved decisions recorded in `APPROVAL_CHECKLIST.md`.
3. This file.
4. `V1_BUILD_PLAN.md`.
5. Feature-specific plans.
6. Existing web/backend behavior.
7. Historical specifications.

The historical `LOGG_MOBILE_IMPLEMENTATION.md` is a reference document. It is
not allowed to silently override the current Personal/Family/Business model,
the one-app strategy, the global design system, or the V1 build sequence.

If two approved plans conflict, the agent must stop implementation, report the
conflict, and request a decision. It must not choose silently because silent
architecture changes create long-term product inconsistency.

## 3. Planning and approval gates

### Planning-only stage

While plans are being reviewed:

- Do not create the mobile application.
- Do not create shared packages.
- Do not modify `frontend/` or `backend/`.
- Add or update planning documents only under `future implementation/`.
- Do not claim native builds, visual quality, or runtime behavior are verified.
- Keep existing research artifacts intact.

### Implementation stage

Application code may begin only after the user approves:

- One Expo/React Native app strategy.
- Personal/Family/Business profile model.
- V1 web feature parity scope.
- Global design-system location and ownership.
- iOS and Android UI strategy.
- Kip local AI and offline behavior.
- Backend sync changes.
- Typography and color direction.

Approval of implementation must not be inferred from a general request to
“continue.” If the user has not approved implementation, remain in planning
mode.

## 4. Repository boundaries

### During planning

Only modify files under:

```text
future implementation/
```

### During implementation

The planning-only directory restriction ends when implementation is explicitly
authorized. `future implementation/` contains plans, progress records, and draft
references; it is not the production app source directory. Create application
and package files in their appropriate implementation locations below.

The planned application locations are:

```text
apps/mobile/
packages/api/
packages/core/
packages/i18n/
packages/design-tokens/
```

Use lowercase `apps/`. `apps/mobile/` is one Expo/React Native application for
both iOS and Android, not two duplicate app codebases. Keep routing under
`apps/mobile/src/app/`, feature modules under `apps/mobile/src/features/`, reusable
native components under `apps/mobile/src/components/`, and the public theme entry
at `apps/mobile/src/theme/index.ts`.

Kip is a feature of that app:

- `apps/mobile/src/features/kip/`: chat UI, hooks, device/runtime adapter, model
  management, and mobile-specific orchestration.
- `packages/core/src/kip/`: platform-independent parsing/validation/rule helpers
  only when reusable across clients. Do not import native modules or browser
  globals into this shared layer.
- Native projects, when generated, belong under `apps/mobile/ios/` and
  `apps/mobile/android/`; manage Expo prebuild customizations through supported
  configuration/plugins/local modules as appropriate. Record the chosen native
  generation/version-control strategy in M03.

Do not create a top-level `kip/` as a separate backend service for the approved
on-device assistant. Store downloaded model weights in managed device storage,
not Git source history. Retain the existing root web/backend locations below;
moving them is not a prerequisite for the mobile workspace.

The existing web and backend remain authoritative references:

```text
frontend/
backend/
```

An agent must not modify existing web/backend behavior merely to make a mobile
screen easier to build. Backend changes must be additive, planned, tested, and
explicitly linked to a requirement.

## 5. Product model rules

The user-facing financial profiles are exactly:

```text
Personal
Family
Business
```

### Personal profile

- Created by default for a new user.
- Private by default.
- Contains personal accounts, transactions, categories, budgets, goals, and
  rules.
- Uses minimal onboarding and editable persona-based category templates.

### Family profile

- Shared by family members.
- Keeps each member's Personal profile private.
- Contains shared accounts, transactions, budgets, goals, and Shared Expenses.
- Must not be implemented as a second duplicate ledger underneath a Shared
  Expenses page.

### Business profile

- Contains business accounts, transactions, invoices, suppliers, reports, tax
  settings, members, and business modules.
- Is isolated from Personal and Family balances.
- Supports business roles and entitlements.

The backend may use a workspace-like data boundary internally, but mobile UI
must use the terms Personal, Family, and Business. Do not expose “workspace” to
users unless a future product decision explicitly approves that language.

## 6. Profile context is mandatory

Every screen that reads or writes financial data must know the active profile.
The active profile must scope:

- API requests.
- SQLite repositories.
- Query/cache keys.
- Outbox mutations.
- Categories.
- Rules.
- Currency.
- Locale.
- Timezone.
- Tax jurisdiction.
- Enabled modules.
- Kip prompts and confirmations.

When switching profiles, the agent must ensure:

1. Previous profile data stops rendering.
2. In-memory queries are cleared or namespaced.
3. Cached data for the selected profile loads immediately.
4. Navigation modules are recalculated.
5. Unsent mutations remain attached to the original profile.
6. Balances are never combined by default.

## 7. Cold-start and profile selection rules

The mobile startup sequence is:

1. Native splash.
2. Secure session/token validation.
3. No valid session: show authentication.
4. Valid session: read profile summaries from SQLite.
5. Zero profiles: onboarding/setup.
6. One profile: open it directly without a picker.
7. Multiple profiles with a valid recent profile: resume it with a visible
   profile header.
8. Multiple profiles without a valid recent profile: show profile picker.
9. Load cached profile data.
10. Synchronize in the background.

The picker chooses a financial context, not another person. Do not use the
phrase “Who is logging today?”

Preferred copy:

- Choose your profile.
- Where are you managing money?
- Choose a financial space.

The picker must not expose sensitive balances. It may show:

- Profile name.
- Profile type.
- Icon/color.
- Family members or business role where useful.
- Offline status.
- Unsynced count.

## 8. Design-system single source of truth

All mobile visual decisions must come from:

```text
apps/mobile/src/theme/index.ts
```

If the implementation uses a shared source directory, the equivalent public
entry point must remain a single theme index.

The theme index owns:

- Light colors.
- Dark colors.
- System/light/dark mode resolution.
- Semantic financial status colors.
- Typography roles.
- Font configuration.
- Spacing.
- Radii.
- Borders.
- Elevation/shadows.
- Motion.
- Reduced-motion behavior.
- Icon sizes.
- Touch targets.
- Form dimensions.
- Component variants.
- Platform overrides.

### Forbidden styling behavior

Feature screens must not introduce:

- Raw hex colors.
- Arbitrary font sizes.
- One-off spacing values.
- Screen-specific shadows.
- Unapproved font families.
- Emoji as UI icons.
- Platform colors copied into shared components.
- Unscoped dark-mode assumptions.

If a screen needs a new visual value, add a semantic token or component token
and document why it is needed.

## 9. Native UI stack rules

Use React Native core primitives plus focused libraries:

- Expo Router for navigation.
- Reanimated for animation.
- Gesture Handler for gestures.
- `@gorhom/bottom-sheet` for sheets.
- `react-native-safe-area-context` for insets.
- `@shopify/flash-list` for large lists.
- `lucide-react-native` for shared vector icons, with platform system-icon
  adapters where appropriate.
- `react-native-svg` for initial charts.
- React Hook Form and Zod for forms.

Do not use React Native Paper as the entire cross-platform design system. Do not
import web Tailwind, shadcn, Radix, or React DOM components into mobile.

## 10. iOS design consistency rules

The iOS app must feel like a deliberate iOS application.

Use:

- Tab bars for primary destinations.
- Navigation stacks for detail flows.
- Large titles and compact titles after scrolling where appropriate.
- Grouped/inset lists for settings and related financial data.
- Native sheets with sensible detents.
- Drag indicators for sheets.
- Native date, time, currency, and confirmation controls where appropriate.
- Toolbar actions placed according to iOS conventions.
- Context menus and swipe actions with visible alternatives.
- SF Pro/San Francisco system typography.
- SF Symbols or a deliberate consistent vector fallback.
- Dynamic Type.
- VoiceOver labels, hints, traits, and reading order.
- Safe-area-aware floating and bottom actions.
- Haptics only for meaningful feedback.
- Subtle materials, separators, and elevation.
- iPhone small-screen, large-screen, and iPad layouts.

Avoid:

- Android-style navigation drawers on primary iPhone screens.
- Overcrowded tab bars.
- Desktop-style tables.
- Web-style modal dialogs where a sheet is appropriate.
- Tiny controls that fail Dynamic Type.
- Hidden critical actions accessible only by swipe.
- Decorative animation that delays financial tasks.

## 11. Android design consistency rules

The Android app must feel like a deliberate Material 3 application.

Use:

- Material hierarchy and spacing.
- Bottom navigation for primary destinations.
- Material bottom sheets.
- Floating quick action where appropriate.
- Predictive back and system back.
- Ripple and pressed states.
- Edge-to-edge layout with centralized insets.
- Material date/time controls where appropriate.
- Roboto/system typography.
- TalkBack labels and state announcements.
- Android font scaling.
- Adaptive layouts for tablets and foldables.

Avoid:

- iOS-only back affordances without system-back support.
- iOS sheet behavior copied without Android adaptation.
- Missing ripple/pressed feedback.
- Content hidden under system bars.
- Tiny controls that fail Android touch targets.

## 12. Shared semantics, platform-specific presentation

The following must remain semantically consistent:

- Transaction states.
- Amount meaning.
- Income/expense direction.
- Reconciliation status.
- Profile permissions.
- Error meaning.
- Offline state.
- Kip confirmation behavior.

The following may differ by platform:

- Navigation hierarchy presentation.
- Sheet detents.
- Back behavior.
- Swipe and long-press actions.
- Date/time picker presentation.
- Icon source.
- Elevation/material treatment.
- Haptics/ripple.

Do not force identical pixels when native platform behavior should differ.

## 13. Kip rules

Kip is the named local AI assistant and must be visible as a floating action in
the right-hand thumb area on suitable screens.

Kip must:

- Show the active profile.
- Show account and currency context.
- Open as a native iOS sheet.
- Open as a Material-style Android bottom sheet.
- Start with typed English and German prompts.
- Parse deterministically before invoking local AI.
- Validate all model output.
- Require user confirmation.
- Store confirmed drafts in SQLite.
- Queue offline mutations.
- Synchronize with idempotent client IDs.
- Preserve delayed-bank provenance.

The first model candidates are Qwen2.5-1.5B-Instruct and Qwen2.5-0.5B-Instruct
quantized GGUF variants. The local runtime must be benchmarked before being
locked. Do not claim model accuracy, memory, or latency without device evidence.

## 14. Financial integrity rules

All financial code must follow these rules:

- Store money as integer minor units or a validated decimal representation.
- Never use floating-point values as the canonical monetary representation.
- Use client IDs for offline idempotency.
- Do not apply a manual and bank amount twice.
- Keep manual and bank provenance when linking.
- Preserve bank-authoritative fields.
- Preserve user-authoritative category/payee/note fields.
- Show ambiguous matches to the user.
- Do not silently delete unmatched rows.
- Keep pending, reconciled, manual-only, and bank-only states explicit.
- Scope all mutations by authenticated user and active profile.

## 15. Web feature parity rules

V1 targets broad functional parity with the existing web application.

For every web route or major feature, the agent must document one of:

1. Native mobile screen.
2. Native mobile adaptation.
3. Public deep-link screen.
4. Temporary authenticated fallback for a low-frequency feature.
5. Later phase with a documented reason.

Core financial workflows must be native. A generic WebView must not be the
primary V1 application experience.

The agent must not remove or ignore an existing web feature simply because its
desktop layout does not fit a phone. It must redesign the information
architecture using mobile lists, filters, sheets, steps, and detail screens.

## 16. Feature implementation workflow

Every feature must follow this order:

### A. Discover

- Locate the web page and route.
- Locate the API methods.
- Locate backend endpoints and schemas.
- Locate permissions/module gates.
- Locate existing tests.
- Locate pure helpers that can be shared.

### B. Define

- Define the mobile user task.
- Define Personal/Family/Business availability.
- Define online/offline behavior.
- Define profile and role behavior.
- Define iOS presentation.
- Define Android presentation.
- Define loading, empty, error, and offline states.

### C. Design review

Before implementation of a substantial screen, review:

- Hierarchy.
- Primary action.
- Navigation.
- Form/list/sheet pattern.
- Light/dark appearance.
- Large text.
- VoiceOver/TalkBack.
- iPhone/Android screen sizes.

### D. Implement

- Use shared API/domain contracts.
- Use the global theme index.
- Build native components.
- Keep feature logic under the feature module.
- Use platform adapters only where interaction differs.

### E. Verify

- Typecheck.
- Unit-test pure logic.
- Test feature states.
- Test online/offline behavior.
- Test profile isolation.
- Test web/mobile parity.
- Test iOS and Android interactions.
- Capture visual evidence for UI changes.

### F. Document

After every meaningful task, update these files under `future implementation/`:

- `IMPLEMENTATION_STATUS.md`: current phase, active issue/task, completed work,
  blockers, remaining work, and the exact next step.
- `IMPLEMENTATION_CHECKLIST.md`: check items only after their required
  implementation verification passes.
- `IMPLEMENTATION_LOG.md`: append changed files, decisions, actual checks/results,
  evidence links, and unavailable validation.

Create missing progress files when implementation starts, preserving previous
records. Keep proposed, active, blocked, and verified work distinguishable. Issue
publication and draft prototypes do not establish implementation completion.

Update feature plans when an approved decision or implementation discovery
changes scope or behavior. Link an issue to its matching plan/checklist entry;
do not leave undocumented exceptions. A new agent must be able to resume using
these repository files without the previous chat.

### G. Complete and close the GitHub issue

When the user authorizes issue-driven implementation, use this lifecycle for
each task:

1. Resolve the backlog ID through `github_issue_map` and read the actual issue,
   current acceptance criteria, and dependency evidence. Never assume M01 means
   GitHub issue #1. Work on one primary issue at a time.
2. Keep the issue open while active. Record an in-progress comment and use
   existing repository labels/Project status if available. If blocked, describe
   the blocker and remaining work; leave it open and record any pause before
   choosing an independent task.
3. Implement the scoped work and run its required checks. Check only acceptance
   items supported by actual evidence; retain the issue marker, dependencies,
   plan links, and unrelated body content when updating the checklist.
4. Update `IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_CHECKLIST.md`, and
   `IMPLEMENTATION_LOG.md` with the issue URL, changes, verification, remaining
   work, and next task. Follow repository GSD state/snapshot rules as applicable.
5. When commits/pushes are authorized, review and publish the task-scoped changes
   to the agreed implementation branch, verify its remote commit, and link the
   commit or merged PR in the completion comment. For a review-only task, publish
   its required durable evidence. Do not close an issue whose only evidence is
   unpublished local changes. If the workflow requires a PR merge, keep the issue
   open until that merge is verified.
6. Only after all acceptance criteria and required checks pass and the delivery
   evidence is available, post a completion summary and close the issue using
   `gh issue close <actual-number> --repo tarunpa1998/logg-main --reason completed`.
   Verify the actual state with `gh issue view` rather than assuming success.
7. After closure is verified, update the V1 epic's matching child checkbox and
   record the actual closed state and next unblocked issue in the progress files.
   Include those tracking changes in a normal follow-up commit when authorized;
   do not amend existing history or leave the final tracking state unpushed.
8. Continue with the next dependency-ready V1 issue. Close EPIC-V1 only after all
   required V1 child tasks and release criteria are verified. L01-L07 remain
   post-V1 work unless explicitly brought into scope.

Planning publication, scaffolding, a passing typecheck alone, a mock UI, or an
unavailable required iOS/Android check is not sufficient to close a delivery
issue. If GitHub updates or closure fail, retain verified local evidence but
record the GitHub action as pending; never report a remotely closed issue that
was not confirmed. If acceptance criteria regress after closure, investigate
and explicitly reopen the issue or create a linked follow-up with an accurate
reason; do not conceal the regression behind a checked epic item.

## 17. TypeScript and architecture rules

All new TypeScript must:

- Use strict typing.
- Avoid `any`.
- Use `import type` for type-only imports.
- Keep API, domain, UI, storage, and native concerns separated.
- Avoid importing browser globals into mobile packages.
- Avoid importing Python/backend code into mobile.
- Avoid importing React DOM components into React Native.
- Use feature directories with clear public exports.
- Keep platform-specific behavior in `.ios`/`.android` files or explicit native
  adapters when appropriate.

## 18. Accessibility rules

Every interactive element must have:

- A minimum 44pt iOS/48dp Android target where practical.
- A visible state.
- An accessible label.
- An accessible role.
- A disabled/loading state where applicable.
- A non-color-only status explanation.

Every feature must support:

- VoiceOver.
- TalkBack.
- Large text/Dynamic Type.
- Reduced motion.
- Keyboard/physical navigation where relevant.

## 19. Privacy and security rules

Agents must not:

- Log access tokens.
- Log passwords or TOTP codes.
- Log complete financial prompts in analytics.
- Put bank credentials into mobile code.
- Put provider secrets into the app.
- Send Kip prompts to a cloud model by default.
- Store sensitive session data in plain local storage.
- Expose one profile's cached data in another profile.

Deep-link parameters must be validated before being used.

## 20. Validation and evidence rules

An agent must not say “done” based only on code inspection.

Required evidence depends on the change:

| Change | Required evidence |
| --- | --- |
| Documentation | File listing and content check |
| TypeScript | Strict typecheck output |
| UI | iOS/Android screenshots or recorded visual review |
| API | Test request/response or integration test output |
| Offline sync | Replay, reconnect, and duplicate-prevention evidence |
| Financial reconciliation | Balance invariant tests and candidate outcomes |
| Native build | iOS and Android development/release build output |

If the required environment is unavailable, report the limitation honestly and
do not claim the check passed.

## 21. Stop conditions

The agent must stop and ask for clarification when:

- The requested feature conflicts with an approved plan.
- The profile context is unclear.
- The feature could mix Personal, Family, or Business data.
- A backend contract is missing or ambiguous.
- A financial merge could double-count a balance.
- A UI request would require bypassing the global design system.
- A package choice is incompatible with the selected Expo/native build.
- A user asks to skip required validation.
- A design decision would make iOS or Android feel like the other platform.

## 22. Completion report format

At the end of a task, the agent must report:

1. Objective completed.
2. Files changed.
3. Profiles/features affected.
4. iOS design decisions.
5. Android design decisions.
6. API/backend impact.
7. Offline/sync impact.
8. Tests and validation evidence.
9. Known limitations.
10. Next plan/checklist item.

The report must distinguish completed work from proposed future work.

## 23. V1 English/German consistency requirement

V1 mobile interface languages are English (`en`) and German (`de`). Every
implementation feature must provide complete coverage in both languages:

- Navigation, buttons, forms, validation, errors, loading, empty, offline,
  permission, reconciliation, Kip feedback, and accessibility messages.
- Shared keys/namespaces, a consistent finance/product glossary, and matching
  interpolation/pluralization rules.
- No hard-coded user-facing English or German inside screens/components.
- Automated missing-key/coverage checks; fallback to English must not conceal
  unfinished German functionality.
- Real layouts with long German text, large fonts, VoiceOver/TalkBack, and both
  themes on iOS/Android.

Reuse appropriate existing web locale resources without importing browser
language-detection behavior. Preserve existing web languages. Other mobile
languages are post-V1 work, not a requirement to block en/de delivery.

UI language is distinct from profile currency, region, timezone, and fiscal
jurisdiction. German formatting may use de-AT/de-DE/de-CH conventions without
requiring three separate translation catalogs for V1. Kip accepts en/de input
independently of the selected interface language; arbitrary model-generated UI
copy must not replace consistent localized confirmation/error templates.

## 24. Final principle

Build Logg as one coherent financial product:

- One native mobile application.
- Personal, Family, and Business profiles.
- One global design system.
- Native iOS behavior.
- Native Android behavior.
- Shared financial rules.
- Local-first Kip.
- Server-authoritative synchronization.
- Explicit evidence for every important decision.

Consistency is more important than speed of generating screens.
