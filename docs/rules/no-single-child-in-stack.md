# no-single-child-in-stack

<!-- @id mui-no-single-child-in-stack -->

Disallow a Stack with a single child.

|         |                                |
| ------- | ------------------------------ |
| Config  | `recommended` (warn), `strict` |
| Autofix | No                             |
| MUI     | all versions                   |

## Why

`spacing`, `direction` and `divider` only matter between two or more children. A Stack with one child is noise; render
the child directly or use `Box`. 2.0 no longer auto-replaces it with `Box`, because Stack-only props on a Box are
invalid in v9.

## Incorrect

```jsx
<Stack spacing={2}>
  <Typography>foo</Typography>
</Stack>
```

## Correct

```jsx
<Typography>foo</Typography>
```

## Limits

Expression children (`{items.map(...)}`) are never reported.
