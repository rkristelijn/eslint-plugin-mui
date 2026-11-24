# ADR-001 — Project initialization with cpm

@id ADR-001 **Status**: superseded by ADR-005 · **Coverage**: none

## Context

This project needed a consistent quality baseline.

## Decision

Use cpm (code project maturity) for quality enforcement.

## Consequences

- Automated formatting, linting and testing via git hooks.
- Maturity level tracking.

## Superseded

cpm was succeeded by keur (keur ADR-028). ADR-005 replaces the cpm setup with keur hooks, a CI gate and annotrace
traceability. `cpm.toml`, `checks/` and the `|| true` Makefile were removed: a gate that swallows failures is not a
gate.
