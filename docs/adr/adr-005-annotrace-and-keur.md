# ADR-005 — annotrace traceability and keur as the quality gate

@id ADR-005 **Status**: accepted · **Date**: 2026-11-24 · **Coverage**: code · **Supersedes**: ADR-001

## Context

The cpm setup (ADR-001) ran `npm test || true`: a gate that cannot fail. There was no way to tell whether a rule had a
doc, a test, or why it existed. keur (the cpm successor) uses annotrace: explicit `@id` / `@implements` / `@proves`
annotations that link concepts, code and tests by stable ID, never by `file:line` (keur ADR-010).

## Decision

Adopt annotrace in this repo:

- Every rule doc declares `@id mui-<rule>`; every ADR declares `@id ADR-NNN` (plus sub-IDs like
  `ADR-003.import-resolution`).
- Code says `@implements <id>` in its file header; tests say `@proves <id>`.
- `scripts/trace.js` harvests the tags and fails (`--strict`) on duplicate IDs, dead links, decisions without code, and
  rules without a proving test. A `Coverage: none` header exempts pure process decisions.

### The gate

@id ADR-005.gate

`npm run check` = prettier + eslint + tests + `trace --strict`. It runs in CI on every push and pull request, and keur
runs as a git pre-commit / pre-push hook (`keur hook --install`) and in CI. Nothing is allowed to fail silently.

## Consequences

- A new rule is not done until it has a doc with `@id`, an `@implements` header and a `@proves` test. The meta-test also
  checks the registry, docs and test files.
