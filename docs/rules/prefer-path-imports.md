# prefer-path-imports

<!-- @id mui-prefer-path-imports -->

Prefer path imports (`@mui/material/Button`) over barrel imports (`@mui/material`).

|         |                                                                                             |
| ------- | ------------------------------------------------------------------------------------------- |
| Config  | `recommended` (warn), `strict`                                                              |
| Autofix | Yes for `@mui/icons-material` (one default import per icon); report only for other packages |
| MUI     | all versions                                                                                |

## Why

Production bundlers tree-shake barrels fine, but in **development** a barrel import makes the dev server load the whole
package. MUI measures named imports from `@mui/icons-material` as up to 6x slower than path imports. MUI uses path
imports in all its own examples.

This rule replaces the deprecated `prefer-named-imports`, which enforced the opposite.

## Incorrect

```jsx
import { Button, TextField } from '@mui/material';
import { Delete, Close as CloseIcon } from '@mui/icons-material';
```

## Correct

```jsx
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Delete from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
```

## Options

```js
'mui/prefer-path-imports': ['warn', { packages: ['@mui/icons-material', '@mui/material'] }] // default
```

Type-only imports (`import type { ButtonProps } from '@mui/material'`) are never reported: they cost nothing at runtime.

## Limits

The `@mui/material` barrel is not auto-fixed: not every export is a component with its own path (`ThemeProvider`,
`useTheme` and `styled` live in `@mui/material/styles`). Use the codemod
`npx @mui/codemod@latest v5.0.0/path-imports <path>`. On Next.js 13.5+, `optimizePackageImports` removes most of the dev
cost too.

## Source

- https://mui.com/material-ui/guides/minimizing-bundle-size/
