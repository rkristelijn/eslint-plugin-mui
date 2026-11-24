# Contributing

## Prerequisites

- Node.js `^20.19 || ^22.13 || >=24`
- [keur](https://github.com/rkristelijn/keur) as the git hook gate (`brew install rkristelijn/keur/keur` or
  `npm i -g keur`, then `keur hook --install`)

## Build

There is no build step; `lib/` is published as is.

```sh
npm ci
```

## Test

```sh
npm test            # node:test + ESLint RuleTester
npm run trace       # annotrace coverage report
npm run check       # format + lint + test + trace --strict (what CI runs)
```

Every rule test runs on ESLint 10. TypeScript syntax is covered with `@typescript-eslint/parser` (`tsx` in
`tests/helpers/rule-tester.js`).

## Code style

- Prettier (`.prettierrc`) and ESLint (`eslint.config.js`, including `eslint-plugin-eslint-plugin`).
- **Data over code (ADR-004):** MUI migration knowledge goes into `lib/data/*.js` with its source link; rules stay
  generic.
- **Autofix only when provably equivalent.** Otherwise report and name the official codemod.
- Small, named helpers; shared AST logic lives in `lib/utils/`.

### Adding a rule

1. `lib/rules/<name>.js` with `@implements mui-<name>` in the header, `meta.docs.url` from `docsUrl()`, `messageId`s,
   and a schema with descriptions.
2. Register it in `lib/index.js` and decide its config (`recommended` / `strict`).
3. `docs/rules/<name>.md` declaring `<!-- @id mui-<name> -->`.
4. `tests/rules/<name>.test.js` with `@proves mui-<name>`: valid cases, invalid cases with `output`, and the edge cases
   where the rule must stay quiet.
5. `npm run check`. `tests/plugin.test.js` fails if any of the above is missing.

If the check can also be done with a single-line regex, mirror it as a keur rule (ADR-006).

## Traceability

annotrace (ADR-005): concepts are declared with `@id` in `docs/`, code says `@implements <id>`, and tests say
`@proves <id>`. Link to IDs, never to `file:line`. `npm run trace:strict` fails on duplicate IDs, dead links, decisions
without code, and rules without a proving test.

## Commits and pull requests

- Conventional Commits: `feat(rules): add no-removed-icons`, `fix(no-system-props): ...`.
- One concern per PR; CI (`check` + keur) must be green.
- Never bypass the hooks (`--no-verify`). Fix what the message tells you, or add a documented entry to `.keurignore`.

## Architecture decisions

See [`docs/adr/`](docs/adr). Write a new ADR for anything that changes a rule's contract, a config or the tooling; do
not duplicate ADR content here.

## Working with AI assistants

AI-written rules get the same bar as any other rule. Check the AST shapes (<https://astexplorer.net>), write the edge
cases yourself, and let the tests and the trace gate decide.
