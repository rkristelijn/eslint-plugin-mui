# no-system-props

<!-- @id mui-no-system-props -->

Disallow MUI System props (`<Box mt={2}>`) on components that lost them in v9, and move them into `sx`.

|         |                                                                   |
| ------- | ----------------------------------------------------------------- |
| Config  | `recommended` (error), `strict`                                   |
| Autofix | Yes (creates `sx`, or appends to an existing `sx` object literal) |
| MUI     | v9                                                                |

## Why

v9 removed the system props from Box, Stack, Typography, Link, Grid, DialogContentText, TimelineContent and
TimelineOppositeContent. Props such as `color` are now passed through to the rendered element instead of being styled.

Component-owned props that share a name are kept, verified against the v9 types: `color` on Typography, Link and
DialogContentText, and `spacing`/`direction` on Stack and Grid (these are not system props).

## Incorrect

```jsx
<Box mt={2} color="primary.main" />
<Stack alignItems="center" spacing={2} />
<Typography fontWeight="bold" />
```

## Correct

```jsx
<Box sx={{ mt: 2, color: "primary.main" }} />
<Stack sx={{ alignItems: "center" }} spacing={2} />
<Typography sx={{ fontWeight: "bold" }} />
```

## Options

```js
'mui/no-system-props': ['error', { ignore: ['width', 'height'] }] // e.g. for <Box component="img" width={..}>
```

## Limits

No autofix when `sx` is not an object literal (`sx={styles}`) or would get a duplicate key; the codemod
`npx @mui/codemod@latest v9.0.0/system-props <path>` handles those. Components rendered without an import (auto-import
plugins) are not detected.

## Source

- https://mui.com/material-ui/migration/upgrade-to-v9/#system-props
