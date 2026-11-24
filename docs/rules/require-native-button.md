# require-native-button

<!-- @id mui-require-native-button -->

Require an explicit `nativeButton` when a button-like MUI component renders a custom component via `component`.

|         |                                               |
| ------- | --------------------------------------------- |
| Config  | `recommended` (warn), `strict`                |
| Autofix | No (only you know what the component renders) |
| MUI     | v9                                            |

## Why

In v9, ButtonBase needs to know before hydration whether it renders a native `<button>`, so the server output has the
correct semantics: `type`, `disabled`, and role/tabIndex for non-buttons. MUI warns in development when `nativeButton`
is missing or wrong. This applies to ButtonBase, Button, Fab, IconButton, ListItemButton, MenuItem, StepButton, Tab,
ToggleButton, AccordionSummary, BottomNavigationAction, CardActionArea, TableSortLabel and PaginationItem.

## Incorrect

```jsx
import Link from 'next/link';
<Button component={Link} href='/'>
  Home
</Button>;
```

## Correct

```jsx
<Button component={Link} href="/" nativeButton={false}>Home</Button>
<Button component="a" href="/">Home</Button>
```

## Limits

HTML tag strings (`component="a"`) are resolved by MUI itself and are not reported. Elements with a prop spread are
skipped.

## Source

- https://mui.com/material-ui/migration/upgrade-to-v9/#buttonbase
