# no-removed-props

<!-- @id mui-no-removed-props -->

Disallow component props removed in MUI v7 / v9 that have no slot replacement.

|         |                                 |
| ------- | ------------------------------- |
| Config  | `recommended` (error), `strict` |
| Autofix | Partly (see table)              |
| MUI     | v7, v9                          |

## Why

| Prop                                    | Removed | Autofix                                              |
| --------------------------------------- | ------- | ---------------------------------------------------- |
| `Dialog`/`Modal` `disableEscapeKeyDown` | v9      | no: ignore `reason === 'escapeKeyDown'` in `onClose` |
| `Dialog`/`Modal` `onBackdropClick`      | v7      | no: use `onClose` with `reason === 'backdropClick'`  |
| `Divider light`                         | v9      | `sx={{ opacity: 0.6 }}`                              |
| `Typography paragraph`                  | v9      | `sx={{ marginBottom: '16px' }}`                      |
| `InputLabel size="normal"`              | v7      | `size="medium"`                                      |
| `Autocomplete renderTags`               | v9      | `renderValue`                                        |

## Incorrect

```jsx
<Dialog open disableEscapeKeyDown onClose={close} />
<Divider light />
<InputLabel size="normal" />
```

## Correct

```jsx
<Dialog open onClose={(e, reason) => reason !== 'escapeKeyDown' && close()} />
<Divider sx={{ opacity: 0.6 }} />
<InputLabel size="medium" />
```

## Source

- https://mui.com/material-ui/migration/upgrade-to-v7/
- https://mui.com/material-ui/migration/upgrade-to-v9/
