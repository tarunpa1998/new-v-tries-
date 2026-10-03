# Mobile Design System and Global Theme Index Plan

## Purpose

Create one easy-to-change global styling entry point for the future iOS and
Android app. The exact colors and typography are intentionally not finalized
yet. The implementation must make those decisions configurable from one index
instead of scattering values across screens and components.

This document describes the planned system only. It does not add the theme
index or components now.

## Global index decision

The future mobile app should expose one public design-system entry point:

```text
apps/mobile/src/theme/index.ts
```

If shared screen source is later moved into `mobile-src/`, the public entry
point should move with it and remain the only import path used by screens:

```text
mobile-src/theme/index.ts
```

Screens and feature components should never import raw hex values, font names,
font sizes, spacing numbers, shadow definitions, or platform colors directly.

The global index should export:

- Current color scheme and theme resolver.
- Light and dark semantic colors.
- Typography roles.
- Font registration metadata.
- Spacing scale.
- Corner-radius scale.
- Border and divider styles.
- Elevation/shadow styles.
- Motion durations and reduced-motion behavior.
- Icon sizes and stroke widths.
- Minimum touch targets.
- Form-control dimensions.
- Component style recipes.
- Financial status colors and labels.
- Platform-specific overrides.

## Theme layers

Use four layers so a palette can change without rewriting components.

### Layer 1 — Raw primitives

Values that can be replaced globally:

- Neutral color ramp.
- Brand color ramp.
- Positive/negative/warning/info ramps.
- Font families.
- Font weights.
- Base spacing units.
- Base radii.
- Shadow/elevation strengths.

Raw primitives should not be used by screen code.

### Layer 2 — Semantic roles

Roles describe meaning rather than a fixed color:

- App background.
- Primary surface.
- Elevated surface.
- Inset surface.
- Primary text.
- Secondary text.
- Disabled text.
- Primary action.
- Pressed primary action.
- Secondary action.
- Focus indicator.
- Divider.
- Error.
- Warning.
- Success.
- Informational.
- Income.
- Expense.
- Transfer.
- Pending.
- Reconciled.
- Needs review.

Components consume semantic roles. Changing the brand ramp then changes every
component that uses the primary action role.

### Layer 3 — Component tokens

Component tokens define consistent dimensions and states:

- Button height, horizontal padding, radius, label style, icon gap, and
  disabled/pressed/loading opacity.
- Input height, label gap, border width, focused border, error border, and
  helper-text spacing.
- Card padding, radius, border, and elevation.
- List-row minimum height, divider inset, icon container, and pressed state.
- Badge padding, radius, label size, and status colors.
- Bottom-sheet corner radius, handle size, backdrop, and safe-area padding.
- Modal width, padding, action layout, and destructive-action treatment.
- Tab-bar height, selected/unselected icon treatment, and label size.
- FAB size, icon size, elevation, and pressed state.
- Skeleton color, shimmer behavior, and reduced-motion fallback.
- Empty/error state spacing and action button treatment.
- Charts, legends, tooltips, and data-label roles.

### Layer 4 — Platform adapters

Platform adapters can adjust presentation without changing semantic intent:

- iOS typography metrics, corner behavior, sheet detents, and shadow model.
- Android Material dimensions, elevation, ripple, and navigation behavior.
- Safe-area and system-inset values.
- Native font scaling and accessibility settings.

## Light and dark mode plan

The global index should support three user modes:

1. System.
2. Light.
3. Dark.

The system mode follows the device. Explicit user choice overrides the device
until changed.

Every semantic role must have both light and dark values. Dark mode should use
dark surfaces rather than simply inverting light values. Text and status colors
must be checked for contrast separately in each mode.

No component may assume that a light background or dark background is always
active.

## Typography plan

Typography is intentionally open for review. The global index should allow
changing the choice without changing component code.

### Required typography roles

- Display amount.
- Screen title.
- Section title.
- Body.
- Body emphasis.
- Label.
- Caption.
- Button label.
- Numeric amount.
- Numeric amount compact.
- Table/data label.
- Monospace/technical value.

### Candidate strategies

| Strategy | Strength | Tradeoff |
| --- | --- | --- |
| System fonts | Best platform integration and accessibility | Less brand-specific |
| Geist-like family | Aligns with current web identity | Requires native font packaging and testing |
| IBM Plex Sans | Financial, professional, readable | Adds a new brand direction |
| Nunito-style family | Friendly and approachable | May feel less financial/operational |

Recommendation for the first implementation: use a system-first typography
layer, keep font-family values configurable, and decide on a packaged brand font
after reviewing screenshots on both platforms and with large accessibility text.

The V1 decision is:

- iOS uses SF Pro/San Francisco system typography.
- Android uses Roboto system typography.
- Typography roles remain exposed through the global theme index.
- IBM Plex Sans remains a later brand-font candidate.

The focused mobile UI library choices and profile-aware startup behavior are
defined in `V1_MOBILE_SHELL_DESIGN_AND_PROFILE_STARTUP_PLAN.md`.

Typography rules:

- Body text should remain at least 16 points by default.
- Amounts should use tabular or stable numeric presentation where available.
- Font scaling must not be disabled.
- Line height must be explicit for dense financial rows.
- Weight must not be the only way to communicate hierarchy.

## Color plan

Colors are also intentionally open for review. The global index should support
swapping the palette while preserving semantic meaning.

### Palette requirements

- Primary action has sufficient contrast in light and dark modes.
- Primary text reaches at least 4.5:1 contrast for normal text.
- Muted text is still readable and not used for essential information.
- Income and expense are not distinguished by color alone.
- Destructive actions use a clear semantic role and confirmation pattern.
- Focus indicators remain visible against every surface.
- Charts use a color-safe set and provide labels/legends.

### Palette direction options to review

1. Neutral + blue: conservative, financial, broadly familiar.
2. Neutral + emerald: positive, savings-oriented, calmer.
3. Neutral + indigo: aligns closely with the current web palette.
4. Warm neutral + blue/green: friendlier for consumer users while retaining
   business credibility.

Do not choose a final palette based only on a color table. Review it in:

- A personal dashboard.
- A business cash-flow screen.
- A dense transaction list.
- A reconciliation warning.
- A form error state.
- Both light and dark mode.
- VoiceOver/TalkBack and color-blind simulation.

## Component coverage plan

The token index should provide style recipes for every planned reusable mobile
component:

### Actions

- Primary, secondary, tertiary, destructive, and text buttons.
- Icon-only buttons with accessible labels.
- Loading and disabled button states.
- Floating quick-add action.

### Forms

- Text input.
- Password input.
- Amount input.
- Currency selector.
- Date selector.
- Category selector.
- Search field.
- Switch.
- Checkbox.
- Radio choice.
- Segmented control.
- Inline validation and helper text.

### Surfaces

- Screen background.
- Card.
- Elevated card.
- List group.
- Bottom sheet.
- Dialog.
- Popover/menu.
- Divider.
- Toast/banner.

### Financial display

- Amount text.
- Balance card.
- Income/expense badge.
- Pending/reconciled status.
- Transaction row.
- Account row.
- Category pill.
- Progress bar.
- Chart and legend.
- Reconciliation candidate card.

### Navigation and states

- Tab bar.
- Screen header.
- Back action.
- Personal/Family/Business profile switcher.
- Loading skeleton.
- Empty state.
- Error state.
- Offline/sync indicator.
- Permission/role notice.

## Global styling workflow

When the product owner wants to change style:

1. Edit raw primitives or semantic theme values in the global index.
2. Review light/dark snapshots of representative screens.
3. Check contrast and touch targets.
4. Check iOS and Android platform adapters.
5. Run component visual tests.
6. Confirm no screen contains an escaped raw style value.

The implementation should include a lint or review convention that rejects new
screen-level raw color literals and arbitrary typography values except inside
the design-system package.

## Design-system approval deliverables

Before building the full mobile UI, prepare for review:

- A light-mode token sheet.
- A dark-mode token sheet.
- Typography samples for all roles.
- Button/input/card/list variants.
- Personal dashboard sample.
- Business dashboard sample.
- Transaction list sample.
- Kip entry sample.
- Reconciliation sample.
- Accessibility contrast report.
- iOS and Android screenshots using the same semantic data.
