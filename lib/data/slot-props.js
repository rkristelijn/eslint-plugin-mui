/**
 * @fileoverview Data: deprecated component props that MUI v9 removed in favour
 * of `slots` / `slotProps`. Source: https://mui.com/material-ui/migration/upgrade-to-v9/
 * (section "Deprecated APIs removed"). Data, not code: a new MUI major only
 * updates this table.
 * @implements ADR-004
 */

'use strict';

/** Shared groups that several components carry. */
const COMPONENTS = { components: 'slots', componentsProps: 'slotProps' };
const TRANSITION = { TransitionComponent: 'slots.transition', TransitionProps: 'slotProps.transition' };
const BACKDROP = { BackdropComponent: 'slots.backdrop', BackdropProps: 'slotProps.backdrop' };
const INPUT = { inputProps: 'slotProps.input', inputRef: 'slotProps.input.ref' };

/**
 * component → deprecated prop → target.
 * Target `slots` / `slotProps` = the whole object moves (keys of `components`
 * are lower-cased: `Root` → `root`). A dotted target names the slot key.
 * @type {Record<string, Record<string, string>>}
 */
const SLOT_PROPS = {
  Accordion: { ...TRANSITION },
  Alert: { ...COMPONENTS },
  Autocomplete: {
    ChipProps: 'slotProps.chip',
    componentsProps: 'slotProps',
    ListboxComponent: 'slots.listbox',
    ListboxProps: 'slotProps.listbox',
    PaperComponent: 'slots.paper',
    PopperComponent: 'slots.popper',
  },
  Avatar: { imgProps: 'slotProps.img' },
  AvatarGroup: { componentsProps: 'slotProps' },
  Backdrop: { ...COMPONENTS, TransitionComponent: 'slots.transition' },
  Badge: { ...COMPONENTS },
  CardHeader: { titleTypographyProps: 'slotProps.title', subheaderTypographyProps: 'slotProps.subheader' },
  Checkbox: { ...INPUT },
  Dialog: { ...BACKDROP, PaperProps: 'slotProps.paper', ...TRANSITION },
  Drawer: {
    ...BACKDROP,
    PaperProps: 'slotProps.paper',
    SlideProps: 'slotProps.transition',
    TransitionComponent: 'slots.transition',
  },
  FilledInput: { ...COMPONENTS },
  FormControlLabel: { componentsProps: 'slotProps' },
  Input: { ...COMPONENTS },
  InputBase: { ...COMPONENTS },
  ListItem: { ...COMPONENTS, ContainerComponent: 'slots.root', ContainerProps: 'slotProps.root' },
  ListItemText: { primaryTypographyProps: 'slotProps.primary', secondaryTypographyProps: 'slotProps.secondary' },
  Menu: { MenuListProps: 'slotProps.list', PaperProps: 'slotProps.paper', TransitionProps: 'slotProps.transition' },
  MobileStepper: { LinearProgressProps: 'slotProps.progress' },
  Modal: { ...BACKDROP, ...COMPONENTS },
  OutlinedInput: { ...COMPONENTS },
  PaginationItem: { components: 'slots' },
  Popover: { ...BACKDROP, PaperProps: 'slotProps.paper', ...TRANSITION },
  Popper: { ...COMPONENTS },
  Radio: { ...INPUT },
  Rating: { IconContainerComponent: 'slotProps.icon.component' },
  Slider: { ...COMPONENTS },
  Snackbar: {
    ClickAwayListenerProps: 'slotProps.clickAwayListener',
    ContentProps: 'slotProps.content',
    ...TRANSITION,
  },
  SpeedDial: { ...TRANSITION },
  SpeedDialAction: {
    FabProps: 'slotProps.fab',
    tooltipTitle: 'slotProps.tooltip.title',
    tooltipPlacement: 'slotProps.tooltip.placement',
    tooltipOpen: 'slotProps.tooltip.open',
    TooltipClasses: 'slotProps.tooltip.classes',
  },
  StepContent: { ...TRANSITION },
  StepLabel: { componentsProps: 'slotProps', StepIconComponent: 'slots.stepIcon', StepIconProps: 'slotProps.stepIcon' },
  SwipeableDrawer: { ...BACKDROP, PaperProps: 'slotProps.paper', SwipeAreaProps: 'slotProps.swipeArea' },
  Switch: { ...INPUT },
  TablePagination: {
    backIconButtonProps: 'slotProps.actions.previousButton',
    nextIconButtonProps: 'slotProps.actions.nextButton',
    SelectProps: 'slotProps.select',
  },
  Tabs: {
    ScrollButtonComponent: 'slots.scrollButtons',
    TabIndicatorProps: 'slotProps.indicator',
    TabScrollButtonProps: 'slotProps.scrollButtons',
  },
  TextField: {
    InputProps: 'slotProps.input',
    inputProps: 'slotProps.htmlInput',
    SelectProps: 'slotProps.select',
    InputLabelProps: 'slotProps.inputLabel',
    FormHelperTextProps: 'slotProps.formHelperText',
  },
  Tooltip: { ...COMPONENTS, PopperComponent: 'slots.popper', PopperProps: 'slotProps.popper', ...TRANSITION },
};

/**
 * Moves that need a human: the key inside the object changes meaning
 * (AvatarGroup `additionalAvatar` → `surplus`). Reported, never auto-fixed.
 * @type {Set<string>}
 */
const MANUAL = new Set(['AvatarGroup.componentsProps']);

/** Codemod names that are not simply `<kebab-component>-props`. */
const CODEMOD_OVERRIDES = { SwipeableDrawer: 'drawer-props' };

/**
 * The official codemod for a component's deprecated props.
 * @param {string} component
 * @returns {string}
 */
function codemodFor(component) {
  const name = CODEMOD_OVERRIDES[component] || `${component.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase()}-props`;
  return `npx @mui/codemod@latest deprecations/${name} <path>`;
}

module.exports = { SLOT_PROPS, MANUAL, codemodFor };
