# Changelog

## 2.0.0

Targets MUI v7 to v9 and ESLint 9 / 10 (flat config).

### Breaking

- ESLint `>= 9.15` and Node `^20.19 || ^22.13 || >=24` are required; eslintrc / ESLint 8 is no longer supported
  (ADR-002).
- **`prefer-named-imports` is deprecated** and in no config. MUI now recommends the opposite; use `prefer-path-imports`.
  Remove the rule from your config.
- **`no-single-child-in-grid`** only reports a Grid **container** with one child. A Grid item with one child is normal.
  The autofix to `Box` was removed because it broke layouts.
- **`no-single-child-in-stack`** no longer autofixes to `Box`, because Stack-only props are invalid on Box in v9.
- **`no-grid-alias`** reports aliases of `Grid`, `Grid2` and `GridLegacy` (was `Grid2` only). It renames references with
  scope analysis instead of a regex over the file.
- The package name in `package.json` is now `@rkristelijn/eslint-plugin-mui` (as published), and the repository links
  point to this repository.

### Added

- Configs `recommended` and `strict`; plugin `meta`.
- Migration guards: `no-deep-imports`, `no-moved-imports`, `no-removed-imports`, `no-removed-icons`, `no-system-props`,
  `prefer-slot-props`, `no-removed-props`, `no-legacy-grid`.
- Hygiene and a11y: `prefer-path-imports`, `require-native-button`, `icon-button-aria-label`.
- `sx` style: `no-literal-spacing`.
- All rules resolve MUI components from barrel imports, path imports and aliases, for `@mui/material`, `@mui/system`,
  `@mui/lab` and `@mui/joy` (ADR-003).
- `no-literal-colors` also checks `bgcolor`, `backgroundColor`, border colors, `outlineColor`, `fill` and `stroke`,
  `#rgba` / `#rrggbbaa`, and color functions.

### Internal

- Zero runtime dependencies (`requireindex` removed); tests on `node:test` instead of mocha; TypeScript cases via
  `@typescript-eslint/parser`.
- annotrace traceability with a `trace --strict` gate. keur hooks and a CI gate replace cpm (ADR-005).
- npm publish with provenance; GitHub Actions pinned to commit SHAs.

## 1.2.1 and earlier

See the git history.
