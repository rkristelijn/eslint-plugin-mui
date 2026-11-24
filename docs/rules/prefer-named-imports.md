# prefer-named-imports (deprecated)

<!-- @id mui-prefer-named-imports -->

> **Deprecated since 2.0.0.** MUI now recommends the opposite: named imports from `@mui/icons-material` are up to 6x
> slower in development than default path imports
> ([source](https://mui.com/material-ui/guides/minimizing-bundle-size/)). Use
> [`prefer-path-imports`](./prefer-path-imports.md) instead. This rule is kept for backward compatibility, is in no
> config, and will be removed in 3.0.0.

This rule enforces the use of named imports for MUI icons instead of default imports.

## Rule Details

This rule aims to ensure that MUI icons are imported using named imports to improve consistency and readability.

Examples of **incorrect** code for this rule:

```js
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
const MyComponent = () => (
  <>
    <CloseIcon />
    <ChevronLeftIcon />
  </>
);
```

Examples of **correct** code for this rule:

```js
import { Close, ChevronLeft } from '@mui/icons-material';
const MyComponent = () => (
  <>
    <Close />
    <ChevronLeft />
  </>
);
```

## Options

This rule does not have any options.

## When Not To Use It

If you prefer to use default imports for MUI icons, you can disable this rule.
