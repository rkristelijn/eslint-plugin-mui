# no-grid-alias

<!-- @id mui-no-grid-alias -->

Disallow renaming MUI Grid imports (`Grid2 as Grid`, `GridLegacy as Grid`).

|         |                                                           |
| ------- | --------------------------------------------------------- |
| Config  | `recommended` (warn), `strict`                            |
| Autofix | Yes (renames the import and every reference, scope-aware) |
| MUI     | all versions                                              |

## Why

An alias hides which Grid API a file uses. `GridLegacy as Grid` reads like the modern Grid but takes `item`/`xs`. The
real name keeps the API visible to readers and to the other rules.

## Incorrect

```jsx
import { GridLegacy as Grid } from '@mui/material';
<Grid item xs={12} />;
```

## Correct

```jsx
import { GridLegacy } from '@mui/material';
<GridLegacy item xs={12} />;
```

## Limits

No fix when the real name is already bound in the module or would be captured in an inner scope, or when the alias is
used as an object shorthand (`{ Grid }`).
