# ADR-002 — Flat config plugin for ESLint 9 and 10, zero runtime dependencies

@id ADR-002 **Status**: accepted · **Date**: 2026-11-24 · **Coverage**: code

## Context

1.x exported only `rules` (loaded with `requireindex`), used the removed `context.getSourceCode()` API, and was tested
with eslintrc-style `RuleTester` options on ESLint 7. ESLint 9 made flat config the default; ESLint 10 removed eslintrc
and the deprecated context methods. Flat-config users had to wire every rule by hand.

## Decision

- The plugin object exports `meta` (`name`, `version`, `namespace`), an explicit `rules` registry and flat configs
  `recommended` and `strict` that reference the plugin object itself.
- Rules use `context.sourceCode` / `sourceCode.getScope()` only, and `meta.defaultOptions` for options. Peer dependency:
  `eslint >= 9.15` (first release with `meta.defaultOptions`).
- **Zero runtime dependencies**: `requireindex` is gone; the registry is explicit, so the published API is reviewable in
  one file.
- Tests run on the built-in `node:test` runner (`RuleTester.describe/it` wired to it). Mocha was dropped: it pulled in
  vulnerable `glob`/`minimatch` versions and adds nothing `node:test` lacks here.

## Consequences

- 2.0.0 is a breaking release (also see ADR-003 for rule behaviour changes).
- ESLint 8 / eslintrc is not supported. Pin 1.x if you need it.
