# no-literal-spacing

<!-- @id mui-no-literal-spacing -->

Disallow literal pixel spacing in `sx` (`p: '16px'`); use theme spacing units.

|         |                                                   |
| ------- | ------------------------------------------------- |
| Config  | `strict`                                          |
| Autofix | Suggestion when the value is a whole or half unit |
| MUI     | all versions                                      |

## Why

Theme spacing units (`p: 2` = 16px with the default 8px base) keep spacing on one scale and follow theme changes. The
rule checks margin, padding and gap keys, including responsive objects and arrays, selectors (`&:hover`) and `sx`
arrays. It is the spacing counterpart of `no-literal-colors`.

## Incorrect

```jsx
<Box sx={{ padding: '16px', mt: { xs: '8px' } }} />
```

## Correct

```jsx
<Box sx={{ padding: 2, mt: { xs: 1 } }} />
```

## Options

```js
'mui/no-literal-spacing': ['error', { spacing: 8 }] // px per theme unit, used for the suggestion
```

## Limits

Only string literals with `px` are checked; `0px`, `rem` and `auto` are allowed. The fix is a suggestion, not an
autofix, because a custom theme can use a different base.

## Source

- https://mui.com/system/spacing/
