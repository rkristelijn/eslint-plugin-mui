# ADR-003 — Rule catalogue for MUI v7–v9

@id ADR-003 **Status**: accepted · **Date**: 2026-11-24 · **Coverage**: code

## Context

MUI is at v9.6 (v8 skipped to align with MUI X). v7 changed the package layout (`exports`, renamed Grid/Grid2) and v9
removed every API deprecated since v5: `*Props`/`*Component` props in favour of `slots`/`slotProps`, System props, the
legacy `*Outline` icons, `GridLegacy`. MUI ships codemods for each of these, but a codemod runs once; nothing stops the
old pattern from coming back in the next commit. 1.x rules also predated v7: they looked for `Grid2` only and only for
barrel imports, and `prefer-named-imports` enforced what MUI now calls an anti-pattern.

## Decision

The plugin's job is to be the **control after the codemod**: every v7/v9 breaking change that is statically detectable
gets a rule, and every message names the official codemod.

- Migration guards (`recommended` as errors): `no-deep-imports`, `no-moved-imports`, `no-removed-imports`,
  `no-removed-icons`, `no-system-props`, `prefer-slot-props`, `no-removed-props`, `no-legacy-grid`.
- Hygiene and accessibility (`recommended` as warnings): `prefer-path-imports`, `require-native-button`,
  `icon-button-aria-label`, `no-grid-alias`, `no-single-child-in-grid`, `no-single-child-in-stack`.
- Opinionated style (`strict` only): `sort-sx-keys`, `no-literal-colors`, `no-literal-spacing`.
- `prefer-named-imports` is deprecated and in no config.

Autofix only when the rewrite is provably equivalent; otherwise report and point at the codemod. A wrong autofix is
worse than none.

### Import resolution

@id ADR-003.import-resolution

Rules resolve which MUI component a JSX element is from the file's imports: barrel (`{ Grid } from '@mui/material'`),
path (`Grid from '@mui/material/Grid'`) and aliases (`{ Grid2 as G }`), for `@mui/material`, `@mui/system`, `@mui/lab`
and `@mui/joy`. A local component that happens to be called `Box` is never reported.

### Moving props into object props

@id ADR-003.object-prop-merge

Props that move into `sx`, `slots` or `slotProps` share one fix builder: create the object prop, or append to an
existing object literal. Give up (report only) when the target is not a literal or a key would be duplicated. All moves
on one element are one combined fix, so autofix never creates two `slotProps`.

### Single-child layout rules

@id ADR-003.single-child

`no-single-child-in-grid` now only fires on a Grid **container**. A Grid item with one child is the normal case, and the
1.x autofix to `Box` broke layouts. Neither single-child rule autofixes any more. A child expression
(`{items.map(...)}`) is never counted as one child.

## Consequences

- Breaking for 1.x users: different `no-single-child-in-*` behaviour, no Grid2 focus, `prefer-named-imports` deprecated.
- Statically undetectable changes stay out of scope (theme `styleOverrides` keys, CSS class names, `useAutocomplete`
  return fields, components rendered through auto-import plugins).
