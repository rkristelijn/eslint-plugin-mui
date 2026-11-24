# no-legacy-grid

<!-- @id mui-no-legacy-grid -->

Disallow the legacy Grid API on the v7+ `Grid`: `item`, `zeroMinWidth`, `xs`..`xl` and `direction="column"`.

|         |                                                                                           |
| ------- | ----------------------------------------------------------------------------------------- |
| Config  | `recommended` (error), `strict`                                                           |
| Autofix | Yes for `item`, `zeroMinWidth` and breakpoints → `size`; report only for column direction |
| MUI     | v7+ (`direction="column"` removed in v9)                                                  |

## Why

Since v7, `Grid` is the former Grid2. Items no longer need `item`, and breakpoint props are replaced by `size`. A
boolean breakpoint (`xs`) meant "grow" and becomes `size="grow"`. v9 dropped `direction="column"`: Grid subdivides
columns, so use `Stack` for vertical layouts.

## Incorrect

```jsx
<Grid item xs={12} md={6} />
<Grid xs />
<Grid container direction="column" />
```

## Correct

```jsx
<Grid size={{ xs: 12, md: 6 }} />
<Grid size="grow" />
<Stack spacing={2} />
```

## Limits

Breakpoints are not folded when the element already has `size`. `GridLegacy` elements are left alone;
`mui/no-removed-imports` reports the import.

## Source

- https://mui.com/material-ui/migration/upgrade-to-grid-v2/
- https://mui.com/material-ui/migration/upgrade-to-v9/#grid
