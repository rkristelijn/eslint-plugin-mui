# no-removed-imports

<!-- @id mui-no-removed-imports -->

Disallow importing MUI exports and modules that were removed in v7 or v9.

|         |                                                                                        |
| ------- | -------------------------------------------------------------------------------------- |
| Config  | `recommended` (error), `strict`                                                        |
| Autofix | Yes where a 1:1 replacement exists (`Grid2` → `Grid`, `experimentalStyled` → `styled`) |
| MUI     | v7+, v9                                                                                |

## Why

These imports fail at build time on current MUI:

| Import                                       | Removed | Replacement                                             |
| -------------------------------------------- | ------- | ------------------------------------------------------- |
| `Grid2`, `Unstable_Grid2`                    | v7      | `Grid` (same component)                                 |
| `GridLegacy`                                 | v9      | `Grid`, via `npx @mui/codemod@latest v7.0.0/grid-props` |
| `Hidden`, `PigmentHidden`                    | v7      | `sx={{ display: { ... } }}` or `useMediaQuery`          |
| `experimentalStyled`                         | v7      | `styled`                                                |
| `StepButtonIcon` (type)                      | v7      | `StepButtonProps['icon']`                               |
| `@mui/material/modern`, `@mui/material/node` | v7      | `@mui/material`                                         |

Each row was checked against the published package layouts of `@mui/material` 6.5.0, 7.3.11 and 9.6.0.

## Incorrect

```jsx
import { Grid2 } from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import Hidden from '@mui/material/Hidden';
```

## Correct

```jsx
import { Grid } from '@mui/material';
import Grid from '@mui/material/Grid';
```

## Limits

The `Grid2` autofix keeps the local name (`import { Grid as Grid2 }`) so no usage changes. `mui/no-grid-alias` then
renames the binding and its usages on the next fix pass.

## Source

- https://mui.com/material-ui/migration/upgrade-to-v7/
- https://mui.com/material-ui/migration/upgrade-to-v9/
