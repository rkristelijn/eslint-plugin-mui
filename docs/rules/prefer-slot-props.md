# prefer-slot-props

<!-- @id mui-prefer-slot-props -->

Prefer `slots` / `slotProps` over the `*Props`, `*Component`, `components` and `componentsProps` props that MUI v9
removed.

|         |                                                                                           |
| ------- | ----------------------------------------------------------------------------------------- |
| Config  | `recommended` (error), `strict`                                                           |
| Autofix | Yes, as one combined fix per element; report only for nested slot paths and unsafe merges |
| MUI     | v9 (deprecated since v5/v6)                                                               |

## Why

v9 removed about 100 deprecated props across 40 components in favour of the standard slot API. The rule is driven by one
data table (`lib/data/slot-props.js`), so a new MUI major only updates data (ADR-004). Each message names the matching
official codemod.

## Incorrect

```jsx
<Dialog PaperProps={{ elevation: 3 }} TransitionComponent={Fade} />
<TextField InputProps={{ startAdornment }} inputProps={{ maxLength: 3 }} />
<Alert components={{ CloseIcon: MyIcon }} />
```

## Correct

```jsx
<Dialog slots={{ transition: Fade }} slotProps={{ paper: { elevation: 3 } }} />
<TextField slotProps={{ input: { startAdornment }, htmlInput: { maxLength: 3 } }} />
<Alert slots={{ closeIcon: MyIcon }} />
```

## Limits

Reported without autofix:

- Nested targets such as `TablePagination backIconButtonProps` → `slotProps.actions.previousButton`, `inputRef` →
  `slotProps.input.ref`, and `SpeedDialAction tooltip*`.
- `AvatarGroup componentsProps`, because its `additionalAvatar` key is renamed to `surplus`.
- `components={variable}`, because its keys must be lower-cased.
- Any case where an existing `slots`/`slotProps` is not an object literal or already has the key.

Props passed via `MenuProps` on `Select` are not inspected.

## Source

- https://mui.com/material-ui/migration/upgrade-to-v9/#deprecated-apis-removed-breaking
