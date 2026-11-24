/**
 * @fileoverview Data: MUI APIs removed in v7 / v9 that are not slot moves.
 * Sources: https://mui.com/material-ui/migration/upgrade-to-v7/ and
 * https://mui.com/material-ui/migration/upgrade-to-v9/ (verified against the
 * published @mui/material 7.3.11 and 9.6.0 package layouts).
 * @implements ADR-004
 */

'use strict';

/**
 * Removed JSX props. `fix` describes the safe autofix, if any:
 * - { kind: 'rename', to }          rename the prop, keep the value
 * - { kind: 'value', from, to }     only a specific string value was removed
 * - { kind: 'sx', entries }         bare/true boolean prop becomes sx entries
 * - absent                          behaviour change; a human decides
 * @type {Record<string, Record<string, { since: string, hint: string, fix?: object }>>}
 */
const REMOVED_PROPS = {
  Autocomplete: {
    renderTags: {
      since: 'v9',
      hint: 'use `renderValue` (the callback receives `getItemProps` instead of `getTagProps`)',
      fix: { kind: 'rename', to: 'renderValue' },
    },
  },
  Dialog: {
    disableEscapeKeyDown: {
      since: 'v9',
      hint: "ignore `reason === 'escapeKeyDown'` in your `onClose` handler",
    },
    onBackdropClick: { since: 'v7', hint: "use `onClose` and check `reason === 'backdropClick'`" },
  },
  Divider: {
    light: { since: 'v9', hint: 'use `sx={{ opacity: 0.6 }}`', fix: { kind: 'sx', entries: [['opacity', '0.6']] } },
  },
  InputLabel: {
    size: {
      since: 'v7',
      hint: '`size="normal"` is now `size="medium"`',
      fix: { kind: 'value', from: 'normal', to: 'medium' },
    },
  },
  Modal: {
    disableEscapeKeyDown: {
      since: 'v9',
      hint: "ignore `reason === 'escapeKeyDown'` in your `onClose` handler",
    },
    onBackdropClick: { since: 'v7', hint: "use `onClose` and check `reason === 'backdropClick'`" },
  },
  Typography: {
    paragraph: {
      since: 'v9',
      hint: "use `sx={{ marginBottom: '16px' }}`",
      fix: { kind: 'sx', entries: [['marginBottom', "'16px'"]] },
    },
  },
};

/**
 * Removed exports. Key = package-relative export as `<source>#<name>`
 * (`default` for path imports). `to` = safe replacement, when one exists.
 * @type {Record<string, { since: string, hint: string, to?: { source: string, name: string } }>}
 */
const REMOVED_EXPORTS = {
  '@mui/material#Grid2': {
    since: 'v7',
    hint: '`Grid2` is now `Grid`',
    to: { source: '@mui/material', name: 'Grid' },
  },
  '@mui/material#Unstable_Grid2': {
    since: 'v7',
    hint: '`Grid2` is now `Grid`',
    to: { source: '@mui/material', name: 'Grid' },
  },
  '@mui/material/Grid2#default': {
    since: 'v7',
    hint: '`Grid2` is now `Grid`',
    to: { source: '@mui/material/Grid', name: 'default' },
  },
  '@mui/material/Unstable_Grid2#default': {
    since: 'v7',
    hint: '`Grid2` is now `Grid`',
    to: { source: '@mui/material/Grid', name: 'default' },
  },
  '@mui/material#GridLegacy': {
    since: 'v9',
    hint: 'migrate to `Grid` (`npx @mui/codemod@latest v7.0.0/grid-props <path>`)',
  },
  '@mui/material/GridLegacy#default': {
    since: 'v9',
    hint: 'migrate to `Grid` (`npx @mui/codemod@latest v7.0.0/grid-props <path>`)',
  },
  '@mui/material#Hidden': { since: 'v7', hint: 'use `sx={{ display: { ... } }}` or `useMediaQuery`' },
  '@mui/material/Hidden#default': { since: 'v7', hint: 'use `sx={{ display: { ... } }}` or `useMediaQuery`' },
  '@mui/material#PigmentHidden': { since: 'v7', hint: 'use `sx={{ display: { ... } }}` or `useMediaQuery`' },
  '@mui/material/PigmentHidden#default': {
    since: 'v7',
    hint: 'use `sx={{ display: { ... } }}` or `useMediaQuery`',
  },
  '@mui/material/styles#experimentalStyled': {
    since: 'v7',
    hint: 'use `styled`',
    to: { source: '@mui/material/styles', name: 'styled' },
  },
  '@mui/material/StepButton#StepButtonIcon': { since: 'v7', hint: "use `StepButtonProps['icon']`" },
};

/** Whole module paths that no longer exist. */
const REMOVED_MODULES = {
  '@mui/material/modern': { since: 'v7', hint: 'import from `@mui/material`; the modern bundle was removed' },
  '@mui/material/node': { since: 'v7', hint: 'import from `@mui/material`; the node bundle was removed' },
};

/**
 * `@mui/lab` exports that moved to `@mui/material` (v7).
 * @type {Set<string>}
 */
const LAB_MOVED = new Set([
  'Alert',
  'AlertTitle',
  'Autocomplete',
  'AvatarGroup',
  'Pagination',
  'PaginationItem',
  'Rating',
  'Skeleton',
  'SpeedDial',
  'SpeedDialAction',
  'SpeedDialIcon',
  'ToggleButton',
  'ToggleButtonGroup',
  'usePagination',
]);

/**
 * Exports that moved from the `@mui/material` barrel to `@mui/material/styles` (v7).
 * @type {Set<string>}
 */
const MOVED_TO_STYLES = new Set(['StyledEngineProvider']);

/**
 * `*Outline` icons removed in v9 → replacement with the same appearance
 * (`null` = no identical replacement exists).
 * @type {Record<string, string | null>}
 */
const REMOVED_ICONS = {
  AddCircleOutline: 'AddCircleOutlineOutlined',
  ChatBubbleOutline: 'ChatBubbleOutlineOutlined',
  CheckCircleOutline: 'CheckCircleOutlineOutlined',
  DeleteOutline: 'DeleteOutlineOutlined',
  DoneOutline: 'DoneOutlineOutlined',
  ErrorOutline: 'ErrorOutlineOutlined',
  HelpOutline: 'HelpOutlineOutlined',
  MailOutline: 'MailOutlineOutlined',
  PauseCircleOutline: 'PauseCircleOutlineOutlined',
  PersonOutline: 'PersonOutlineOutlined',
  PieChartOutline: 'PieChartOutlineOutlined',
  PlayCircleOutline: 'PlayCircleOutlineOutlined',
  RemoveCircleOutline: 'RemoveCircleOutlineOutlined',
  StarOutline: 'StarOutlineOutlined',
  WorkOutline: 'WorkOutlineOutlined',
  DriveFileMoveOutline: 'DriveFileMoveOutlined',
  InfoOutline: 'InfoOutlined',
  LabelImportantOutline: 'LabelImportantOutlined',
  LightbulbOutline: 'LightbulbOutlined',
  LockOutline: 'LockOutlined',
  WorkspacesOutline: 'WorkspacesOutlined',
  ModeEditOutline: 'ModeEdit',
  PeopleOutline: null,
};

/**
 * Deep `@mui/material/styles/<module>` default exports → the named export
 * that `@mui/material/styles` offers for the same value (v9 styles/index.d.ts).
 * Modules not listed have no 1:1 replacement and are reported without a fix.
 * @type {Record<string, string>}
 */
const STYLES_DEFAULT_EXPORTS = {
  createColorScheme: 'createColorScheme',
  createStyles: 'createStyles',
  createTheme: 'createTheme',
  createThemeWithVars: 'extendTheme',
  getOverlayAlpha: 'getOverlayAlpha',
  identifier: 'THEME_ID',
  makeStyles: 'makeStyles',
  responsiveFontSizes: 'responsiveFontSizes',
  shouldSkipGeneratingVar: 'shouldSkipGeneratingVar',
  styled: 'styled',
  ThemeProvider: 'ThemeProvider',
  useTheme: 'useTheme',
  useThemeProps: 'useThemeProps',
  withStyles: 'withStyles',
  withTheme: 'withTheme',
};

/** Deep paths with a known flat replacement. */
const DEEP_PATH_MOVES = {
  '@mui/material/TablePagination/TablePaginationActions': '@mui/material/TablePaginationActions',
};

module.exports = {
  DEEP_PATH_MOVES,
  STYLES_DEFAULT_EXPORTS,
  LAB_MOVED,
  MOVED_TO_STYLES,
  REMOVED_EXPORTS,
  REMOVED_ICONS,
  REMOVED_MODULES,
  REMOVED_PROPS,
};
