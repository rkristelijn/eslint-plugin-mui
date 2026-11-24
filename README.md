# @rkristelijn/eslint-plugin-mui

ESLint rules for [MUI](https://mui.com) (Material UI v7 to v9). They guard the breaking changes of v7 and v9 so they
stay migrated, keep imports fast, and catch accessibility and `sx` mistakes.

MUI ships a codemod for each breaking change, but a codemod runs once. These rules are the control afterwards: the old
pattern cannot come back in the next commit. Every message names the matching codemod.

- ESLint 9 and 10, flat config, zero runtime dependencies
- Autofix only where the rewrite is provably equivalent
- Migration knowledge is data (`lib/data/`), checked against the published `@mui/material` 7.3.11 / 9.6.0 packages

## Installation

```sh
npm install --save-dev eslint @rkristelijn/eslint-plugin-mui
```

## Usage

```js
// eslint.config.js
import mui from '@rkristelijn/eslint-plugin-mui';

export default [
  mui.configs.recommended, // or mui.configs.strict
];
```

ESLint only lints `*.js`, `*.mjs` and `*.cjs` by default. For `.jsx` (or `.tsx` with a TypeScript parser), scope the
config to your files:

```js
export default [{ files: ['**/*.{js,jsx,ts,tsx}'], ...mui.configs.recommended }];
```

Or configure individual rules:

```js
import mui from '@rkristelijn/eslint-plugin-mui';

export default [
  {
    plugins: { mui },
    rules: {
      'mui/prefer-slot-props': 'error',
      'mui/no-system-props': 'error',
    },
  },
];
```

- **`recommended`**: removed or moved APIs are errors (they break on MUI v9); import hygiene and a11y are warnings.
- **`strict`**: every rule as an error, including the opinionated `sx` style rules.

Upgrading from 1.x? See the [changelog](CHANGELOG.md).

## Rules

🔧 = autofix · 💡 = suggestion · ✅ = in `recommended` · 🔒 = only in `strict`

### MUI v7 / v9 migration guards

| Rule                                                   | Description                                                                              |       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----- |
| [no-deep-imports](docs/rules/no-deep-imports.md)       | No imports more than one level deep (private, broken since v7)                           | ✅ 🔧 |
| [no-moved-imports](docs/rules/no-moved-imports.md)     | `@mui/lab` components that moved to `@mui/material`, `StyledEngineProvider`              | ✅ 🔧 |
| [no-removed-imports](docs/rules/no-removed-imports.md) | `Grid2`, `GridLegacy`, `Hidden`, `experimentalStyled`, ...                               | ✅ 🔧 |
| [no-removed-icons](docs/rules/no-removed-icons.md)     | The 23 `*Outline` icons removed in v9, fixed to the same-looking icon                    | ✅ 🔧 |
| [no-system-props](docs/rules/no-system-props.md)       | `<Box mt={2}>` → `sx` (v9)                                                               | ✅ 🔧 |
| [prefer-slot-props](docs/rules/prefer-slot-props.md)   | `PaperProps`, `TransitionComponent`, `componentsProps`, ... → `slots` / `slotProps` (v9) | ✅ 🔧 |
| [no-removed-props](docs/rules/no-removed-props.md)     | `disableEscapeKeyDown`, `Divider light`, `Typography paragraph`, ...                     | ✅ 🔧 |
| [no-legacy-grid](docs/rules/no-legacy-grid.md)         | `item`, `xs`..`xl` → `size`, `direction="column"` on Grid                                | ✅ 🔧 |

### Imports, accessibility and layout

| Rule                                                               | Description                                                  |       |
| ------------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| [prefer-path-imports](docs/rules/prefer-path-imports.md)           | Path imports instead of barrels (up to 6x faster dev builds) | ✅ 🔧 |
| [require-native-button](docs/rules/require-native-button.md)       | Explicit `nativeButton` with a custom `component` (v9)       | ✅    |
| [icon-button-aria-label](docs/rules/icon-button-aria-label.md)     | `IconButton` needs an accessible name                        | ✅    |
| [no-grid-alias](docs/rules/no-grid-alias.md)                       | No `Grid2 as Grid` / `GridLegacy as Grid`                    | ✅ 🔧 |
| [no-single-child-in-grid](docs/rules/no-single-child-in-grid.md)   | No Grid container with one child                             | ✅    |
| [no-single-child-in-stack](docs/rules/no-single-child-in-stack.md) | No Stack with one child                                      | ✅    |

### `sx` style

| Rule                                                   | Description                                    |       |
| ------------------------------------------------------ | ---------------------------------------------- | ----- |
| [no-literal-colors](docs/rules/no-literal-colors.md)   | Theme palette tokens instead of literal colors | 🔒    |
| [no-literal-spacing](docs/rules/no-literal-spacing.md) | Theme spacing units instead of `'16px'`        | 🔒 💡 |
| [sort-sx-keys](docs/rules/sort-sx-keys.md)             | Sorted `sx` keys                               | 🔒 🔧 |

### Deprecated

| Rule                                                       | Replaced by                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [prefer-named-imports](docs/rules/prefer-named-imports.md) | [prefer-path-imports](docs/rules/prefer-path-imports.md) (MUI now recommends the opposite) |

## Also in keur

The checks that a single-line regex can do reliably are mirrored as [keur](https://github.com/rkristelijn/keur) rules
(`UI-MIS-016` and up), so they also run as a pre-commit gate in repos that do not use ESLint (ADR-006).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the decisions in [docs/adr](docs/adr). Every rule is traced with annotrace
(`@id` / `@implements` / `@proves`) and `npm run check` must pass.

## Credits

Based on [rafaelgomesxyz/eslint-plugin-mui](https://github.com/rafaelgomesxyz/eslint-plugin-mui). `sort-sx-keys` is
based on [eslint-plugin-sort-keys-fix](https://github.com/leo-buneev/eslint-plugin-sort-keys-fix).

Contributors: [Ensar025](https://github.com/Ensar025), [rafaelgomesxyz](https://github.com/rafaelgomesxyz),
[rkristelijn](https://github.com/rkristelijn).

## License

[MIT](LICENSE)
