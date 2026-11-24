/**
 * @fileoverview Data: MUI System style props that v9 removed from components
 * (use `sx` instead), plus component-owned props that share a name and must
 * stay. Source: https://mui.com/material-ui/migration/upgrade-to-v9/#system-props
 * and https://mui.com/system/properties/
 * @implements ADR-004
 */

'use strict';

const SPACING = [
  'm',
  'mt',
  'mr',
  'mb',
  'ml',
  'mx',
  'my',
  'p',
  'pt',
  'pr',
  'pb',
  'pl',
  'px',
  'py',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginX',
  'marginY',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingX',
  'paddingY',
  'paddingInline',
  'paddingInlineStart',
  'paddingInlineEnd',
  'paddingBlock',
  'paddingBlockStart',
  'paddingBlockEnd',
];

const OTHER = [
  // display
  'display',
  'displayPrint',
  'overflow',
  'textOverflow',
  'visibility',
  'whiteSpace',
  // flexbox
  'flexBasis',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignContent',
  'order',
  'flex',
  'flexGrow',
  'flexShrink',
  'alignSelf',
  'justifyItems',
  'justifySelf',
  // grid
  'gap',
  'rowGap',
  'columnGap',
  'gridColumn',
  'gridRow',
  'gridAutoFlow',
  'gridAutoColumns',
  'gridAutoRows',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridTemplateAreas',
  'gridArea',
  // positions
  'position',
  'zIndex',
  'top',
  'right',
  'bottom',
  'left',
  // palette
  'color',
  'bgcolor',
  'backgroundColor',
  // borders
  'border',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRadius',
  // shadows
  'boxShadow',
  // sizing
  'width',
  'maxWidth',
  'minWidth',
  'height',
  'maxHeight',
  'minHeight',
  'boxSizing',
  // typography
  'typography',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textTransform',
];

/** Every system prop name. */
const SYSTEM_PROPS = new Set([...SPACING, ...OTHER]);

/** Spacing-only keys (used by no-literal-spacing). */
const SPACING_KEYS = new Set([...SPACING, 'gap', 'rowGap', 'columnGap']);

/**
 * Components that lost system props in v9 → own props that share a system
 * prop name and therefore stay (verified against @mui/material 9.6.0 types).
 * @type {Record<string, Set<string>>}
 */
const SYSTEM_PROP_COMPONENTS = {
  Box: new Set(),
  DialogContentText: new Set(['color']),
  Grid: new Set(),
  Link: new Set(['color']),
  Stack: new Set(),
  Typography: new Set(['color']),
  TimelineContent: new Set(),
  TimelineOppositeContent: new Set(),
};

/**
 * Button-like components that accept `nativeButton` in v9.
 * @type {Set<string>}
 */
const BUTTON_LIKE = new Set([
  'ButtonBase',
  'Button',
  'Fab',
  'IconButton',
  'ListItemButton',
  'MenuItem',
  'StepButton',
  'Tab',
  'ToggleButton',
  'AccordionSummary',
  'BottomNavigationAction',
  'CardActionArea',
  'TableSortLabel',
  'PaginationItem',
]);

module.exports = { BUTTON_LIKE, SPACING_KEYS, SYSTEM_PROPS, SYSTEM_PROP_COMPONENTS };
