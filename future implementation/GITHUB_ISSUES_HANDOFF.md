# GitHub Issue Publication and Planning Push Handoff

## 1. Requested repository and current result

- Repository: `tarunpa1998/logg-main`
- GitHub URL: https://github.com/tarunpa1998/logg-main
- SSH remote supplied by the user: `git@github.com:tarunpa1998/logg-main.git`
- Issue definitions: `GITHUB_ISSUES_MANIFEST.json` in this directory.
- Local publication status: **not published**.
- GitHub issue numbers/URLs: **not assigned**.
- Planning commit/push: **not performed**.

The current execution environment returned:

```text
git status --short
fatal: not a git repository (or any parent up to mount point /mnt)

gh --version
/bin/bash: line 1: gh: command not found

gh auth status
/bin/bash: line 1: gh: command not found
```

These results show that this local folder is an exported/untracked copy and the
GitHub CLI is unavailable here. They do **not** establish whether the repository
is public/private, whether the user lacks permissions, or whether another
environment has working SSH/GitHub authentication.

The user requested a file-based fallback for Antigravity if publication was
blocked. This handoff and its manifest are that fallback.

## 2. Authorization and task boundary for the next agent

The user has requested creation of the backlog issues and pushing the intended
planning artifacts into the supplied repository. This handoff authorizes that
publication task; it is not an instruction to implement the application now.

Publish only intended files inside `future implementation/`. The SQL and
TypeScript files already inside `future implementation/mobile/` are draft
reference artifacts, not a working mobile app. Do not mark them implemented or
validated by publishing them.

Do not upload the entire exported folder, create a new unrelated repository
history, force-push, overwrite remote work, or stage frontend/backend/secrets
merely because they are present locally. Preserve the existing remote history.

No PR, store release, payment integration, or app implementation is requested by
this publication task.

## 3. Complete issue inventory

The manifest defines **51 issues**:

- **1 V1 delivery epic**.
- **43 V1 implementation/verification/release tasks**.
- **7 explicitly deferred post-V1 tasks**.

The task IDs below are stable backlog IDs, **not GitHub issue numbers**.

### V1 tracking and foundation

| ID | Topic |
| --- | --- |
| EPIC-V1 | Whole V1 delivery and release acceptance |
| M01 | Scope, contract audit, route-by-route parity inventory |
| M02 | Persistent progress tracking and validation baseline |
| M03 | Single Expo workspace and native development builds |
| M04 | Shared native-safe API/domain contracts |
| M05 | Required English/German translation system and checks |
| M06 | Global theme and reusable native components |
| M07 | Native platform navigation and shell |
| M08 | Authentication, setup, registration, 2FA, secure sessions |
| M09 | Existing OIDC/passkey functionality |
| M10 | Personal/Family/Business membership and module contracts |
| M11 | Minimal onboarding and category templates |
| M12 | Versioned profile-scoped SQLite repositories |
| M13 | Backend idempotency, bootstrap, cursor sync, tombstones |
| M14 | Durable outbox, reconnect, conflicts and recovery |
| M15 | Cold start, picker, profile switching, last-profile resume |

### Core finance, banking, and Kip

| ID | Topic |
| --- | --- |
| M16 | Accounts, balances, account detail, card cycles |
| M17 | Transaction timeline/forms/transfers/calendar/actions |
| M18 | Categories, payees, groups, collections |
| M19 | Personal/Family/Business dashboards |
| M20 | Bank connections, OAuth callbacks, settings, sync status |
| M21 | Bank observations, identities, authorization/booking/value dates |
| M22 | Delayed reconciliation and exact-once balance effects |
| M23 | Matching evidence, candidate decisions and history |
| M24 | Local Qwen/runtime benchmarks on iOS/Android |
| M25 | Deterministic en/de Kip extraction and semantic validation |
| M26 | Floating Kip assistant, review, offline save and cloud sync |

### Product parity

| ID | Topic |
| --- | --- |
| M27 | Budgets and goals |
| M28 | Recurring transactions, installments and rules |
| M29 | Family sharing, groups, splits, settlements |
| M30 | Business invoices, products, payment links |
| M31 | Invoice schedules and schedule detail |
| M32 | Reports, existing exports and fiscal settings |
| M33 | Transaction/investment imports, previews and logs |
| M34 | Attachments, previews, sharing and public invoice links |
| M35 | Assets/investments/portfolio workflows |
| M36 | Existing server agents, chat, management and connections |
| M37 | Profile settings, preferences and administration |
| M38 | Approved subscription/entitlement lifecycle |

### Verification and distribution

| ID | Topic |
| --- | --- |
| M39 | Route-by-route web/mobile functional parity |
| M40 | Native design, en/de, accessibility and adaptive-layout review |
| M41 | Financial integrity, privacy, sync and performance validation |
| M42 | Optional biometric unlock and APNs/FCM integration |
| M43 | Signed release builds and distribution readiness |

### Post-V1, not release blockers

| ID | Topic |
| --- | --- |
| L01 | On-device voice input |
| L02 | Physical receipt capture/OCR |
| L03 | Austrian RKSV decoding/verification research |
| L04 | Structured PDF/XML invoice extraction and OCR fallback |
| L05 | Reviewed archival compliance and BMD/RZL extensions |
| L06 | Evidence-led LoRA/fine-tuning evaluation |
| L07 | Additional mobile languages after English/German |

Each manifest entry contains a ready-to-render title, scope, kind, phase,
dependency IDs, plan references, scope description, acceptance checklist, and
verification requirements. The shared definition of done applies to every issue.

### Local preparation verification

The preparation validator completed successfully with this output:

```text
PASS: JSON syntax, 51 unique issue IDs/titles, complete handoff inventory
PASS: dependency references are acyclic and predecessor-ordered (127 links)
PASS: 19 referenced planning files exist
PASS: 44 V1 issues (epic + 43 tasks), 7 post-V1 issues
PASS: bilingual/progress requirements and README/agent-rule references present
CONFIRMED: publication remains not_published; no invented GitHub issue mapping
```

This verifies the local handoff structure only. It is not evidence that GitHub
issues exist, Git changes were pushed, or any application feature was built.

## 4. Important V1 scope distinctions

- **Required UI languages:** en and de on both platforms. Use common German
  resources with appropriate regional number/date/currency formatting. More
  mobile languages are L07; keep existing web language support.
- **Profiles:** Personal, Family, Business. Family is not hard-coded to exactly
  two users; actual seats/roles follow the approved product plan.
- **Native quality:** iOS follows HIG with native hierarchy, sheets, grouped
  controls, system typography, Dynamic Type and VoiceOver; Android follows
  Material 3, back behavior, insets, pressed states and TalkBack.
- **Kip:** local typed en/de capture, deterministic first, model assistance when
  needed, validated drafts, confirmation, SQLite, outbox, later bank linking.
- **Offline scope:** Kip capture is required. Each other module must declare
  whether reads/writes work offline; web feature parity does not imply every
  server workflow works offline.
- **Documents:** existing invoice/attachment functionality is V1 parity. New AI
  receipt/PDF extraction is post-V1 and must not delay text Kip.
- **Server agents:** existing server-agent functionality is separate from local
  Kip. Do not silently turn Kip into a cloud assistant.
- **Payments:** plans/modules exist in the product design, but billing-provider,
  store purchase, pricing and seat decisions still need verification. M38 must
  not fabricate successful subscriptions.
- **Status:** every implementation issue starts open/unimplemented. Existing
  draft files and accepted plans are not proof that app features are complete.

## 5. Prepare GitHub access

Use the GitHub CLI in an authenticated environment. Verify:

```text
gh --version
gh auth status
gh repo view tarunpa1998/logg-main --json nameWithOwner,url,defaultBranchRef,viewerPermission,hasIssuesEnabled
```

Confirm that issues are enabled and the current account can create issues and
push a branch. SSH access for Git and GitHub API access for `gh` are separate
requirements. If either is unavailable, report exactly which action is blocked;
do not record fake URLs or commits.

Do not print tokens or change global Git identity/configuration to work around
authentication. Let the owner supply credentials through the environment's
normal authentication flow if necessary.

## 6. Work in a real checkout and preserve history

### When an authenticated checkout already exists

Use that checkout. Inspect its status, remote URL, tracked/default branch, and
recent commits before copying or staging anything. Preserve unrelated local
work.

### When only this exported folder exists

Verify an intended sibling parent directory, then clone the supplied repository
into a new checkout. Do not clone over this folder or initialize it as a fresh
root history.

Example, replacing the destination with an available verified path:

```text
git clone git@github.com:tarunpa1998/logg-main.git "<verified-new-checkout-path>"
```

Compare the remote `future implementation/` contents with the local planning
directory. Copy/merge only intended additions and reviewed updates, keeping
unfamiliar remote files. The manifest describes source-relative plan paths; it
does not contain credentials.

Use a dedicated planning branch, for example `docs/mobile-v1-planning`, based on
the actual default branch. If that branch already exists, inspect its history
instead of resetting it. Do not assume the default branch is named `main`.

## 7. Create issues idempotently with gh

### A. Check existing issues first

Inspect both open and closed issues:

```text
gh issue list --repo tarunpa1998/logg-main --state all --limit 1000 --json number,title,body,url
```

If necessary, page through the repository's issues with `gh api --paginate` so
the search is complete. Exclude pull requests when using the issues API.

Every published body must include this stable identifier, replacing ID:

```text
<!-- logg-mobile-backlog:ID -->
```

Find existing entries by stable marker or exact title. Reuse their issue number
and URL instead of creating duplicates. If a matching issue is already closed,
inspect its completion evidence and current scope; do not reopen/overwrite it
automatically.

### B. Milestones and labels

Create/reuse the two manifest milestones with `gh api`:

- `Logg Mobile V1`
- `Logg Mobile Post-V1`

Do not invent deadlines. Reuse repository labels where appropriate; optionally
create descriptive `mobile-v1`, `mobile-post-v1`, and `mobile-epic` labels if
needed. Labels are organizational metadata and must not block issue publication.

### C. Render complete bodies

For each entry, assemble:

1. Its `body_markdown` exactly as reviewed.
2. A `Plan references` section linking each `plan_files` entry under
   `future implementation/` in the target planning branch, with spaces encoded
   correctly in GitHub URLs.
3. The manifest's `common_body_markdown`.
4. A `Dependencies` section with actual linked issue URLs. No dependencies means
   explicitly state that this task can begin once publication/preflight is ready.
5. Its phase, scope, and stable marker.

Create entries in manifest order; predecessors therefore exist before dependent
issues. The EPIC-V1 body is populated with child task checklists after all V1
issues exist.

### D. Create and verify each issue

Use tool-created temporary Markdown bodies and:

```text
gh issue create --repo tarunpa1998/logg-main --title "<manifest-title>" --body-file "<rendered-body-file>" --milestone "<matching-milestone>"
```

Apply chosen labels only if they exist. After creation, verify the returned URL
and body with `gh issue view`. Record `{ number, url, publication_status }` under
`github_issue_map[ID]` in the manifest immediately, so interrupted runs resume
without creating the same issues again.

Dependency references may be normal body links; GitHub parent/sub-issue or
dependency API support is optional. Do not block the handoff on an unavailable
advanced issue feature.

### E. Finish the epic and partial-run handling

Update EPIC-V1 with:

- A checkbox link for every M01–M43 issue.
- A separate unchecked or plain-link section for L01–L07, explicitly not V1
  release gates.
- Remaining scope/approval decisions that genuinely block delivery.

Do not mark implementation checkboxes complete during publication. If a request
fails, record the error, already-created mappings, remaining IDs, and retry
position; do not recreate successful entries.

## 8. Review, commit, and push the planning files

Before committing, inspect:

```text
git status --short
git diff
git log --oneline -10
```

Inspect new/untracked files too, since plain `git diff` does not show their
contents. Confirm that only intended planning artifacts, the issue manifest,
its URL mapping, and handoff/index updates will be staged.

Stage only those intended paths. Do not use `git add .` on an unfamiliar
checkout. Review the staged diff and run documentation/manifest validation
before committing.

Choose a concise commit message matching the repository's existing style, such
as `docs(mobile): add V1 plans and GitHub backlog`. Do not skip hooks, amend
unrequested history, or create an empty commit. If a hook fails, fix the real
issue and create a successful commit normally.

Push the dedicated planning branch normally, for example:

```text
git push -u origin docs/mobile-v1-planning
```

Verify the remote tracking reference and commit after the push. If branch
protection or credentials prevent publication, report that exact blocker. Do
not force-push or claim that the default branch was updated when only a separate
branch was pushed.

Creating all issues can happen before or after the first planning commit. If
the URL map is filled after that commit, publish it in an additional ordinary
commit so the final pushed branch contains the actual mapping. Do not leave the
mapping only in the working tree.

## 9. Publication verification checklist

- [ ] Repository owner/name verified as `tarunpa1998/logg-main`.
- [ ] GitHub CLI authenticated and permissions verified.
- [ ] Remote default branch/history inspected.
- [x] Manifest has 51 unique IDs/titles and valid dependency references (local
      preparation validated).
- [x] Plan references exist in the planning directory (local preparation
      validated).
- [ ] Existing open/closed issues checked for duplicates.
- [ ] Each expected issue has a verified number and URL in `github_issue_map`.
- [ ] All issue dependencies use real links, not guessed `#` numbers.
- [ ] Epic links every V1 task and separates later work.
- [ ] English/German and progress-update rules are included in every body.
- [ ] `publication_status` is accurate: not published, partially published, or
      published; this describes GitHub publication, not implementation.
- [ ] Intended planning commit contains no unrelated code or secrets.
- [ ] Normal push verified; branch and commit SHA returned to the user.
- [ ] Final response includes the epic URL, issue count, and any incomplete IDs.

## 10. Copyable publication-only prompt for Antigravity

This prompt prepares GitHub and publishes planning documents only. To start
building the apps, use `NEW_CHAT_IMPLEMENTATION_PROMPT.md`, which authorizes the
implementation lifecycle after publication/preflight.

```text
Publish the Logg mobile planning backlog to my existing repository:
git@github.com:tarunpa1998/logg-main.git

Read future implementation/AI_AGENT_IMPLEMENTATION_RULES.md,
future implementation/GITHUB_ISSUES_HANDOFF.md, and
future implementation/GITHUB_ISSUES_MANIFEST.json first.

I authorize creating the manifest's 51 GitHub issues, their organizational
milestones/labels where needed, and committing/pushing the intended planning
files to a dedicated planning branch. Do not implement the mobile app now.

Verify gh authentication, repository permissions, and actual Git history. If
this folder has no .git, clone the existing repository into a verified new
checkout and merge only the intended future implementation/ files. Do not
initialize unrelated history, overwrite remote work, or force-push.

Use gh for issue operations. Check open and closed issues for duplicate stable
markers/titles. Render each complete body from its issue definition, plan
references, shared definition of done, and real dependency URLs. Save actual
issue numbers/URLs to github_issue_map immediately after verifying each issue.
Build the V1 epic checklist and clearly separate post-V1 enhancements.

All tasks require native iOS HIG/Android Material 3 consistency, en/de UI, and
Personal/Family/Business data isolation. Every future implementation task must
update IMPLEMENTATION_STATUS.md, IMPLEMENTATION_CHECKLIST.md, and
IMPLEMENTATION_LOG.md with actual evidence and remaining work.

Inspect git status, diffs, untracked content, staged changes, and recent log
before committing. Stage only intended planning files, run validation, commit
in repository style, and push normally to a planning branch. Preserve web and
backend code. Do not create a PR or publish a release without another request.

Return the epic URL, verified issue count, branch URL/commit SHA, and any
remaining publication blockers. Do not claim success for unperformed actions.
```

## 11. Implementation issue lifecycle after publication

Once the user authorizes building, agents must follow section 16 G of
`AI_AGENT_IMPLEMENTATION_RULES.md` and the completion lifecycle in every rendered
issue body. The order is:

1. Select the next dependency-ready V1 issue by actual mapped number.
2. Keep it open with an in-progress update while implementing.
3. Verify every acceptance criterion; record checks and any blockers.
4. Update status, implementation checklist, and evidence log.
5. Publish authorized task changes/evidence and verify their remote delivery.
6. Post the completion evidence and close the actual GitHub issue as completed.
7. Verify CLOSED, update the epic child checkbox and persistent tracking, publish
   those tracking updates when authorized, and choose the next unblocked task.

Typical GitHub commands, using the actual issue number rather than M01, are:

```text
gh issue comment <actual-number> --repo tarunpa1998/logg-main --body-file "<completion-evidence-file>"
gh issue close <actual-number> --repo tarunpa1998/logg-main --reason completed
gh issue view <actual-number> --repo tarunpa1998/logg-main --json number,state,url,closedAt
```

Partial, blocked, unpublished, or insufficiently verified work stays open.
Closing issues is an implementation action, not a publication checklist step.
Keep EPIC-V1 open until its V1 child tasks and release criteria pass; leave the
seven post-V1 enhancements outside that release gate.

The full new-chat build prompt is saved in `NEW_CHAT_IMPLEMENTATION_PROMPT.md`.
Copy only its fenced prompt into the next chat after reviewing its explicit
implementation, issue-management, commit, and normal-push authorization.
