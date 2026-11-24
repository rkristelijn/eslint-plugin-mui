# no-moved-imports

<!-- @id mui-no-moved-imports -->

Disallow importing MUI exports from the package they moved out of.

|         |                                     |
| ------- | ----------------------------------- |
| Config  | `recommended` (error), `strict`     |
| Autofix | Yes (switches or splits the import) |
| MUI     | v7+                                 |

## Why

In v7 these `@mui/lab` exports moved to `@mui/material`: Alert, AlertTitle, Autocomplete, AvatarGroup, Pagination,
PaginationItem, Rating, Skeleton, SpeedDial, SpeedDialAction, SpeedDialIcon, ToggleButton, ToggleButtonGroup and
usePagination. `StyledEngineProvider` can no longer be imported from the `@mui/material` barrel; it lives in
`@mui/material/styles`.

## Incorrect

```jsx
import { TabContext, Rating } from '@mui/lab';
import ToggleButton from '@mui/lab/ToggleButton';
import { Button, StyledEngineProvider } from '@mui/material';
```

## Correct

```jsx
import { TabContext } from '@mui/lab';
import { Rating } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import { Button } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
```

## Limits

An import that combines a default and named specifiers is reported but not split.

## Source

- https://mui.com/material-ui/migration/upgrade-to-v7/#lab-components-moved-to-the-main-package
