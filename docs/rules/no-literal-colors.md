# no-literal-colors

<!-- @id mui-no-literal-colors -->

Disallow literal color values in the MUI `sx` prop; use theme palette tokens.

|         |              |
| ------- | ------------ |
| Config  | `strict`     |
| Autofix | No           |
| MUI     | all versions |

This rule disallows the use of literal color values in the `sx` prop of MUI components. Instead, it encourages the use
of theme-based color values.

## Rule Details

This rule checks the color keys inside an `sx` attribute (`color`, `bgcolor`, `backgroundColor`, `borderColor` and the
per-side border colors, `outlineColor`, `fill`, `stroke`). It reports hex values (`#rgb`, `#rgba`, `#rrggbb`,
`#rrggbbaa`), color functions (`rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`) and CSS named colors.

Examples of **incorrect** code for this rule:

```js
const Header = (
  <Box
    sx={{
      color: '#FFF',
    }}
  />
);
```

Examples of **correct** code for this rule:

```js
const Header = (
  <Box
    sx={{
      color: 'primary.main',
    }}
  />
);
```

## Options

This rule does not have any options.

## When Not To Use It

If you want to allow literal color values in the `sx` prop, then it's safe to disable this rule.
