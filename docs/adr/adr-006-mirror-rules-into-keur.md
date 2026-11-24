# ADR-006 — Mirror the regex-able MUI checks into keur

@id ADR-006 **Status**: accepted · **Date**: 2026-11-24 · **Coverage**: none

## Context

ESLint only runs where a project has configured this plugin. keur runs as a language-agnostic pre-commit gate across
repos, including ones that never installed it. keur already ships MUI rules `UI-MIS-010` to `UI-MIS-015`.

## Decision

The subset that a single-line RE2 regex can detect reliably goes into keur as `UI-MIS-016` and up: barrel icon imports,
deep imports, `@mui/lab` moved imports, removed exports, removed `*Outline` icons, deprecated slot props and System
props. Each keur rule refers back to the ESLint rule (`@see`) and has its own keur `@proves` scenario. JSX-structure
checks (scope, children, Tooltip parents) stay ESLint-only, because a regex would produce false positives.

The keur rules live in the keur repo (`@external keur:UI-MIS-016` ...). This ADR has no code in this repo, so
`Coverage: none`.

## Consequences

- Two places to update on a new MUI major. The data tables (ADR-004) are the source; the keur rules list their source
  table in a comment.
