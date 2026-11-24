# no-removed-icons

<!-- @id mui-no-removed-icons -->

Disallow the 23 legacy `*Outline` icons removed in MUI v9, with an autofix to the icon that looks the same.

|         |                                                              |
| ------- | ------------------------------------------------------------ |
| Config  | `recommended` (error), `strict`                              |
| Autofix | Yes (22 of 23; `PeopleOutline` has no identical replacement) |
| MUI     | v9                                                           |

## Why

Adding a "d" does not always give the same icon: `ErrorOutline` is an outlined circle, but `ErrorOutlined` is a
**filled** circle. The data table maps each removed icon to the one with the same appearance, for example `ErrorOutline`
→ `ErrorOutlineOutlined`, `InfoOutline` → `InfoOutlined` and `ModeEditOutline` → `ModeEdit`. Every mapping was checked
against `@mui/icons-material` 9.6.0.

## Incorrect

```jsx
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { InfoOutline } from '@mui/icons-material';
```

## Correct

```jsx
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { InfoOutlined as InfoOutline } from '@mui/icons-material';
```

## Limits

Theme variants (`InfoOutlineRounded`, `DeleteOutlineSharp`) were not removed and are not reported.

## Source

- https://mui.com/material-ui/migration/upgrade-to-v9/#material-icons
