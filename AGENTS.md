# Antigravity Workspace Directives & Skills Integration

This repository is configured to operate in accordance with the specialized skills located in `skills/` and `.agents/skills/`. Whenever working on this codebase, Antigravity must activate and strictly follow the principles, architectures, and guidelines defined below.

---

## 🧭 Active Skills Index

| Skill | Primary Domain | Core Reference |
| :--- | :--- | :--- |
| **frontend-expert** | React / TypeScript / TanStack / Modern Web | [frontend-expert/SKILL.md](skills/frontend-expert/SKILL.md) |
| **mobile-developer** | React Native / Flutter / Native Integration | [mobile-developer/SKILL.md](skills/mobile-developer/SKILL.md) |
| **uiux-designer** | Design Systems / UI / UX / Accessibility | [uiux-designer/SKILL.md](skills/uiux-designer/SKILL.md) |

---

## 1. Frontend Development (`frontend-expert`)

When creating or modifying web components, pages, hooks, or API services:

- **Suspense-First Architecture**:
  - Never use early returns with loading spinners (`if (isLoading) return <LoadingSpinner />`) as this causes layout shift.
  - Wrap components in `<SuspenseLoader>` and establish clean `<Suspense>` boundaries.
  - Utilize `useSuspenseQuery` for TanStack Query data fetching where applicable.
- **Strict TypeScript**:
  - Maintain 100% strict TypeScript types; no `any` types allowed.
  - Use `import type { ... }` for type-only imports.
  - Follow the `React.FC<Props>` pattern with explicit prop interfaces.
- **Directory & Feature Architecture**:
  - Organize domain logic under `features/{feature-name}/` with subdirectories: `api/`, `components/`, `hooks/`, `helpers/`, `types/`.
  - Truly reusable components reside in `components/`.
  - Use standardized import aliases: `@/` (`src/`), `~types`, `~components`, `~features`.
- **Component & Style Standards**:
  - Keep styling inline if under 100 lines; extract to a separate file if over 100 lines.
  - For MUI v7 Grid syntax, use `<Grid size={{ xs: 12, md: 6 }}>` (not the obsolete `xs={12}` format).
  - Use `useCallback` for event handlers passed down to children and `useMemo` for heavy computational tasks.
  - Default exports at the bottom, named components at declaration.

---

## 2. Mobile Development (`mobile-developer`)

When building or updating cross-platform mobile apps (React Native / Flutter):

- **Architecture & Structure**:
  - Follow modular feature-based architecture (`src/features/{feature-name}/`).
  - Strict typing in TypeScript / Dart.
- **Offline-First Design**:
  - Implement cache-first strategies with non-blocking background sync (never block UI waiting on raw network fetches).
  - Use resilient local storage (SQLite, Realm, Keychain/Keystore for secrets).
- **Platform-Specific Adaptations**:
  - Use `Platform.select()` for small styling/configuration variations.
  - Use dedicated platform extensions (`.ios.ts`, `.android.ts`) for complex native differences.
- **Native Device Integrations**:
  - Handle push notification registrations for both APNs and FCM gracefully.
  - Secure sensitive data in Keychain/Keystore, never in plain local storage.
  - Validate all deep link parameters and follow App Store / Play Store compliance checklists.

---

## 3. UI/UX & Design Intelligence (`uiux-designer`)

When designing components, picking palettes, building responsive layouts, or auditing UX:

- **Priority 1: Accessibility (CRITICAL)**:
  - Contrast ratio >= 4.5:1 for normal text.
  - Visible focus rings/states on all interactive elements.
  - Descriptive `alt` text for images and `aria-label` for icon-only buttons.
  - Keyboard navigation: visual order must match Tab order.
- **Priority 2: Touch & Interaction (CRITICAL)**:
  - Minimum 44x44px touch target size on interactive elements.
  - Loading buttons must be visually disabled during asynchronous actions to prevent double-submissions.
  - Clear error feedback positioned directly near the relevant input field.
  - Ensure `cursor: pointer` is applied to clickable elements.
- **Priority 3: Performance (HIGH)**:
  - Optimize images (WebP format, lazy loading, responsive srcset).
  - Respect `prefers-reduced-motion` for animations.
  - Prevent content jumping (CLS) by reserving space for asynchronous data.
- **Priority 4: Layout & Responsive (HIGH)**:
  - Responsive viewport scaling (`width=device-width, initial-scale=1`).
  - Minimum 16px font size on mobile to prevent automatic zooming on iOS.
  - Prevent unintentional horizontal scrolling.
- **Priority 5: Typography & Aesthetics**:
  - Comfortable line height (1.5–1.75 for body text) and line length (65–75 characters).
  - Cohesive design system and SVG icons (never emoji icons).
  - 150–300ms smooth micro-interactions using GPU-accelerated `transform` and `opacity`.

---

## ⚙️ Skill Discovery Configuration

Skills are registered in `.agents/skills.json` and mirrored in `.agents/skills/` for native Antigravity discovery and automatic activation.
