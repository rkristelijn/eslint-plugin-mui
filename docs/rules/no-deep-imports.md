# no-deep-imports

<!-- @id mui-no-deep-imports -->

Disallow MUI imports more than one level deep.

|         |                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Config  | `recommended` (error), `strict`                                                                                |
| Autofix | Yes for `styles/<module>` default imports, `TablePagination/TablePaginationActions` and `icons-material/esm/*` |
| MUI     | v7+                                                                                                            |

## Why

Since v7 the MUI packages use the `exports` field in `package.json`. Paths deeper than one level were always private
API; now bundlers and Node refuse to resolve them, so the build breaks.

## Incorrect

```jsx
import createTheme from '@mui/material/styles/createTheme';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
import Close from '@mui/icons-material/esm/Close';
```

## Correct

```jsx
import { createTheme } from '@mui/material/styles';
import TablePaginationActions from '@mui/material/TablePaginationActions';
import Close from '@mui/icons-material/Close';
```

## Options

```js
'mui/no-deep-imports': ['error', { allow: ['@mui/material/internal'] }] // prefixes that may be deep
```

## Limits

Only the packages that use `exports` since v7 are checked: `@mui/material`, `@mui/system`, `@mui/lab`, `@mui/joy`,
`@mui/icons-material`, `@mui/utils` and `@mui/styled-engine(-sc)`. MUI X versions separately, and v7 has no `exports`,
so its deep paths are left alone.

Deep **type** imports (`import type { TypographyOptions } from '@mui/material/styles/createTypography'`) are reported
but not rewritten, because some interfaces were renamed (`TypographyOptions` → `TypographyVariantsOptions`).

## Source

- https://mui.com/material-ui/migration/upgrade-to-v7/#package-layout-updated
