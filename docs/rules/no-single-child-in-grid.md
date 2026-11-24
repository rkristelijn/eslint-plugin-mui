# no-single-child-in-grid

<!-- @id mui-no-single-child-in-grid -->

Disallow a Grid **container** with a single child.

|         |                                |
| ------- | ------------------------------ |
| Config  | `recommended` (warn), `strict` |
| Autofix | No                             |
| MUI     | all versions                   |

## Why

A container with one item adds grid layout for nothing. A Grid **item** (`size`) with one child is the normal case and
is not reported. That changed in 2.0: the old rule flagged items too, and its autofix to `Box` broke layouts.

## Incorrect

```jsx
<Grid container spacing={2}>
  <Grid size={12}>
    <Card />
  </Grid>
</Grid>
```

## Correct

```jsx
<Grid container spacing={2}>
  <Grid size={6}>
    <Card />
  </Grid>
  <Grid size={6}>
    <Card />
  </Grid>
</Grid>
```

## Limits

A single child that is an expression (`{items.map(...)}`, `{children}`) can render many elements and is never reported.
