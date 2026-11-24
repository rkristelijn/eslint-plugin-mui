# icon-button-aria-label

<!-- @id mui-icon-button-aria-label -->

Require an accessible name on MUI `IconButton`.

|         |                                |
| ------- | ------------------------------ |
| Config  | `recommended` (warn), `strict` |
| Autofix | No                             |
| MUI     | all versions                   |

## Why

An icon has no text, so without a name a screen reader announces just "button" (WCAG 2.2 SC 4.1.2 Name, Role, Value).
`aria-label` and `aria-labelledby` count. So does a parent MUI `<Tooltip title>`, because Tooltip sets the label on its
child, and so does visible text inside the button. `title` alone is not accepted: it is a weak fallback in the
accessible-name algorithm and is not exposed on touch devices.

## Incorrect

```jsx
<IconButton onClick={remove}>
  <DeleteIcon />
</IconButton>
```

## Correct

```jsx
<IconButton aria-label="Delete" onClick={remove}><DeleteIcon /></IconButton>
<Tooltip title="Delete"><IconButton onClick={remove}><DeleteIcon /></IconButton></Tooltip>
```

## Limits

Elements with a prop spread are skipped.

## Source

- https://mui.com/material-ui/react-button/#icon-button
- https://www.w3.org/WAI/WCAG22/Understanding/name-role-value
