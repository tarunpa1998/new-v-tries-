# New-chat prompt: build Logg Mobile V1

Copy the fenced prompt below into the new AI-agent chat in the Logg workspace.
Using it authorizes implementation, GitHub issue management, task-scoped
commits, and normal pushes to a dedicated implementation branch. Review that
authorization before sending it. This file is a planning artifact; no app code,
GitHub issue closure, commit, or push was performed merely by writing it.

At preparation time this local folder was not a Git checkout, `gh` was missing,
and the 51-issue manifest was unpublished. The new agent must recheck the actual
environment and remote state; do not assume those blockers have been resolved
or that the repository still has no implementation.

## Folder ownership

`future implementation/` is the planning/progress folder. The planning-only edit
restriction does not apply to the authorized implementation stage in this
prompt. Production mobile code belongs in lowercase `apps/mobile/`, shared code
in `packages/`, and required additive server work in the existing `backend/`.

Kip's native UI/runtime integration belongs in
`apps/mobile/src/features/kip/`; genuinely reusable pure parsing/validation
helpers belong in `packages/core/src/kip/`. Model weights belong in managed
device storage, not Git. There is no separate root `kip/` backend in the approved
architecture.

## Copyable prompt

```text
Start building Logg Mobile V1 for iOS and Android from the plans in this
repository. Carry out implementation, not just another proposed roadmap.

REPOSITORY AND AUTHORIZATION
Repository: tarunpa1998/logg-main
SSH remote: git@github.com:tarunpa1998/logg-main.git

I approve the V1 baseline described below and authorize its implementation,
necessary additive shared-package/backend integration, GitHub issue creation
or reuse, progress comments/checklists, and closing verified completed issues.
I authorize reviewed, task-scoped commits and normal pushes to a dedicated V1
implementation branch. Discover and preserve existing branch/history; do not
force-push, overwrite unrelated work, bypass hooks, amend commits, merge to the
default branch, create a PR, or publish to app stores without another request.
Publication of evidence to that dedicated implementation branch is the delivery
requirement for closing these tasks; it is not default-branch merge or release.

MANDATORY PREFLIGHT
1. Read applicable AGENTS.md and PROJECT_RULES.md, then:
   - future implementation/AI_AGENT_IMPLEMENTATION_RULES.md
   - future implementation/README.md
   - future implementation/V1_BUILD_PLAN.md
   - future implementation/IMPLEMENTATION_SEQUENCE.md
   - future implementation/APPROVAL_CHECKLIST.md
   - future implementation/GITHUB_ISSUES_HANDOFF.md
   - future implementation/GITHUB_ISSUES_MANIFEST.json
2. Read the relevant native shell/design, profile, frontend parity, backend API,
   and Kip plans as required by the agent rules. Load applicable mobile,
   frontend, design, verification, and workflow skills when they genuinely
   match the task. Inspect current web/backend code before changing contracts.
3. Read existing IMPLEMENTATION_STATUS.md, IMPLEMENTATION_CHECKLIST.md,
   IMPLEMENTATION_LOG.md, and applicable .gsd state. Preserve their history.
   Resume existing verified work; do not assume the app is still unbuilt.
4. Verify Git history, status, remotes, default branch, gh authentication and
   repository permissions. If this is an exported folder with no .git, clone
   the existing repository into a verified new checkout and carefully merge
   the intended planning files. Do not initialize unrelated history. Ensure
   the implementation checkout includes the reviewed plans and issue map.
5. If issues are not published, follow GITHUB_ISSUES_HANDOFF.md to create/reuse
   the 51 entries, check open/closed duplicates, and persist verified issue
   numbers/URLs. Recheck existing issue bodies for the current shared lifecycle;
   add missing rules while preserving their checkboxes, evidence and metadata.
   Never assume M01 is issue #1. If authentication/tools prevent publication,
   resolve available setup steps and report the exact remaining blocker.
6. Satisfy the repository's SPEC -> PLAN -> EXECUTE -> VERIFY -> COMMIT gate.
   Establish/finalize .gsd/SPEC.md from this explicitly approved baseline before
   application code, and prepare the required roadmap/task plans. Record only
   the approvals this prompt actually grants. Historical specifications cannot
   silently override the one-app/profile/design decisions below.

APPROVED PRODUCT AND ARCHITECTURE
- One React Native/Expo source app in apps/mobile/ producing iOS and Android.
  Use compatible current versions, development builds/prebuild, and native
  integrations; Expo Go alone is not enough for local inference. Verify actual
  iOS signing/macOS/Xcode or EAS availability and Android build tooling.
- The previous future implementation/-only restriction was for planning, not
  application development. Use lowercase apps/mobile/src/app/ for routes,
  src/features/ for feature modules, and src/components/ for reusable native UI.
  Generated native projects belong under apps/mobile/ios/ and android/; use
  appropriate Expo configuration/plugins and record the generation strategy.
- Shared packages: packages/api/, packages/core/, packages/i18n/,
  packages/design-tokens/. Share contracts, domain logic and locale resources,
  not React DOM, Tailwind, browser UI, or Python implementation code.
- Put Kip UI, hooks, model management and native inference integration in
  apps/mobile/src/features/kip/. Put genuinely reusable pure parser/validation
  helpers in packages/core/src/kip/. Keep downloaded weights in managed device
  storage, not Git. Do not create a separate top-level kip/ service or duplicate
  iOS/Android product codebases. Keep existing frontend/ and backend/ locations.
- Preserve the current web app and backend behavior. Backend remains the
  canonical financial authority. Add tested sync/auth/profile functionality
  only when linked to a planned requirement. Bank credentials/provider calls
  stay server-side.
- One login with Personal, Family and Business financial profiles. Personal
  data remains private; Family is a shared ledger, not a two-member-only mode;
  Business has separate finance/settings/members/modules. Membership,
  entitlements and billing ownership are distinct. Never invent final pricing,
  seat limits, a billing provider, tax/legal policy, or unapproved deferrals.
- Automatically create a minimal private Personal profile for a truly new
  user. An existing account with empty local cache is not a new-user signal.
  One accessible profile opens directly; multiple profiles resume the last
  accessible one or show a context picker when needed. SQLite/cache/outbox,
  roles and pending writes must remain tied to the correct user/profile.
- Port current web functionality as native/adapted mobile workflows. Maintain
  a route/subflow parity matrix. Core finance, profiles, banking and Kip are
  native; any temporary first-party low-frequency fallback needs explicit
  approval and a defined authenticated, network-required flow.

DESIGN AND LOCALIZATION
- Use one global design system with public entry
  apps/mobile/src/theme/index.ts. Reusable components consume semantic tokens
  for colors, system typography, spacing, radius, elevation and motion.
- Use current Logg-derived provisional light/dark colors and platform system
  fonts for V1: SF Pro/system on iOS, Roboto/system on Android. Keep custom
  branding revisable centrally; do not introduce arbitrary screen styling.
- Deliver polished native iOS HIG behavior: appropriate titles/navigation,
  grouped lists, controls, sheets, safe areas, keyboard handling, haptics,
  Dynamic Type, VoiceOver and iPad adaptation. Android follows Material 3,
  platform back behavior, ripple, TalkBack and adaptive layouts. Share product
  semantics while preserving appropriate platform interactions.
- English en and German de are mandatory throughout V1: navigation, forms,
  errors, loading/empty/offline states, permissions, Kip and accessibility.
  Use consistent keys/glossary/pluralization; no hard-coded interface text or
  fallback that conceals missing German. Test long German text, font scaling,
  light/dark themes and both platforms. Preserve existing web languages.
  UI language is separate from currency/region/timezone/tax jurisdiction.

OFFLINE FINANCE AND KIP
- Use user/profile-scoped SQLite with secure session handling, cache-first
  nonblocking UI, atomic ledger/outbox writes, durable retries and idempotent
  client IDs. Distinguish offline local access from online authorization.
  Store secrets in platform secure storage. Define cursor/conflict/tombstone
  behavior and protect pending writes during switches, logout and revocation.
- Preserve decimal/minor-unit precision according to currency. A manual
  transaction and its later bank observation become one canonical transaction
  without double counting, lost user notes/categories, or deleted evidence.
  Keep reported and projected balances distinct. Auto-link only sufficiently
  strong, unique candidates; ambiguous matches require user decisions.
- Kip V1 is typed English/German on-device transaction assistance: parser,
  aliases/user corrections/rules first, local model fallback when ambiguous,
  semantic validation, editable confirmation, then SQLite/outbox and sync.
  Benchmark Qwen2.5-1.5B-Instruct Q4 GGUF and a 0.5B fallback plus native runtime
  compatibility on real devices; do not promise unmeasured performance.
  AI must not invent IDs, modify the ledger directly, or silently use cloud AI.
  Clarify ambiguous currency/account/amount. No sensitive prompt analytics;
  synchronizing user notes/original text needs an explicit storage policy.
- L01-L07 are post-V1: voice, receipt OCR, RKSV, PDF/XML extraction, archival/
  BMD/RZL, fine-tuning and additional languages. Do not pull them into V1.

ISSUE-BY-ISSUE EXECUTION AND DONE RULE
1. Start with M01 if not already verified; otherwise resume the earliest
   unfinished dependency-ready V1 issue. Use the manifest and actual issue map.
   Work on one primary issue at a time and read its acceptance criteria and
   dependency completion evidence. Keep it open with an in-progress update.
2. Discover contracts, define states/platform behavior, implement the scoped
   work, then verify all required criteria. Use strict TypeScript, feature
   modules and platform adapters. Do not replace functionality with mock data,
   TODO stubs, screenshots-only screens or a generic WebView.
3. Run meaningful required type/build/test, financial, offline, profile,
   localization and UI checks for the issue. Capture actual commands/results
   and visual/device evidence when required. Missing signing/device access or
   failed required checks are blockers, not passes. Existing failures need an
   honest baseline. Check only evidence-backed acceptance items.
4. After every meaningful task update, create/preserve and update:
   - future implementation/IMPLEMENTATION_STATUS.md: phase, active issue URL,
     completed/blocked/remaining work, branch/commit and exact next task.
   - future implementation/IMPLEMENTATION_CHECKLIST.md: verified items only.
   - future implementation/IMPLEMENTATION_LOG.md: chronological changed files,
     decisions, commands/results, evidence links and unavailable checks.
   Also maintain required .gsd state/snapshots. A new chat must resume without
   needing this chat history. Keep publication status separate from completion.
5. Review status/diffs/untracked files/staged changes/recent log; stage only
   intended task files, commit in repository style and push normally to the
   dedicated implementation branch. Verify the remote commit and record it.
6. Only when EVERY acceptance criterion and required check passes and delivery
   evidence is published: post a completion comment with the commit/evidence,
   checks, outcomes and next task; close the actual issue via
   gh issue close <actual-number> --repo tarunpa1998/logg-main --reason completed
   Then verify CLOSED using gh issue view. Do not report closure on assumption.
7. Check the corresponding V1 epic child item only after verified closure.
   Update status/checklist/log with the closed issue and next unblocked issue,
   and publish those tracking changes in a normal follow-up commit if needed.
8. Continue through dependency-ready V1 issues. Partial, blocked, unpublished
   or insufficiently tested issues remain open with exact remaining steps.
   If a GitHub operation fails, record it as pending. If blocked, pause and
   record that issue before working on an independent one; do not skip gates.
   Close EPIC-V1 only after required V1 children and release acceptance pass.

START NOW AND REPORT
Begin with environment/history/issue-state verification and M01 or the recorded
next task. Resolve prerequisites and proceed into implementation when the gate
is satisfied; do not finish at a generic plan. Continue until the session's
tasks are verified or a concrete blocker needs my decision. Ask only for real
blocking choices/credentials, while progressing independent authorized work.
At each task boundary report the actual issue URL/status, changes, checks,
branch/commit, blockers and next task. Before ending, persist a self-contained
resume note with exact commands/steps and the next issue. Distinguish local work,
remote publication, verified issue closure and release readiness accurately.
```
