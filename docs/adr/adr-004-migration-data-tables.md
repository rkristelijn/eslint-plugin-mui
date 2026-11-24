# ADR-004 — Migration knowledge is data, not code

@id ADR-004 **Status**: accepted · **Date**: 2026-11-24 · **Coverage**: code

## Context

v9 alone removed about 100 props across 40 components, 23 icons and several exports. One rule per component would be 40
near-identical files that all change on the next major.

## Decision

The knowledge lives in tables under `lib/data/`: `slot-props.js`, `removed.js` and `system.js`. A few generic rules
interpret them. A new MUI major updates data, not rule logic. Every table names its source (the official migration
guide). The tables were checked against the **published packages** (`@mui/material` 6.5.0 / 7.3.11 / 9.6.0 and
`@mui/icons-material` 9.6.0 `.d.ts` and file layout), not only against the docs. That check found, for example, that
`color` is still an own prop of Typography, Link and DialogContentText.

## Consequences

- Table consistency is tested (`tests/data.test.js`): targets are well-formed and icon replacements are not themselves
  removed.
- The same tables can be exported for other tools. keur mirrors the regex-able subset (ADR-006).
