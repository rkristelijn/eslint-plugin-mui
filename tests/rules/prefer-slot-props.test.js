/**
 * @fileoverview Tests for `prefer-slot-props`
 * @proves mui-prefer-slot-props
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/prefer-slot-props');
const { SLOT_PROPS, codemodFor } = require('../../lib/data/slot-props');

const err = (prop, component) => ({
  messageId: 'useSlot',
  data: { prop, component, target: SLOT_PROPS[component][prop], codemod: codemodFor(component) },
});
const IMPORT =
  "import { Dialog, TextField, Alert, AvatarGroup, TablePagination, Tooltip, Checkbox } from '@mui/material';\n";

createRuleTester().run('prefer-slot-props', rule, {
  valid: [
    `${IMPORT}<Dialog slotProps={{ paper: { elevation: 3 } }} />;`,
    `${IMPORT}<TextField slotProps={{ htmlInput: { maxLength: 3 } }} />;`,
    // a prop that is deprecated on one component is fine on another
    `${IMPORT}<Checkbox PaperProps={{}} />;`,
    // not MUI
    '<Dialog PaperProps={{ elevation: 3 }} />;',
  ],
  invalid: [
    {
      name: 'spread in slotProps may hold the same key (and wins): no fix',
      code: `${IMPORT}<Dialog PaperProps={{ elevation: 1 }} slotProps={{ ...custom }} />;`,
      output: null,
      errors: [err('PaperProps', 'Dialog')],
    },
    {
      name: 'ListboxComponent → slotProps.listbox.component (keeps the styled listbox), manual',
      code: "import { Autocomplete } from '@mui/material';\n<Autocomplete ListboxComponent={CustomListbox} />;",
      output: null,
      errors: [err('ListboxComponent', 'Autocomplete')],
    },
    {
      name: 'single slot prop, no slotProps yet',
      code: `${IMPORT}<Dialog open PaperProps={{ elevation: 3 }} />;`,
      output: `${IMPORT}<Dialog open slotProps={{ paper: { elevation: 3 } }} />;`,
      errors: [err('PaperProps', 'Dialog')],
    },
    {
      name: 'slots and slotProps in one go',
      code: `${IMPORT}<Dialog TransitionComponent={Fade} TransitionProps={{ timeout: 500 }} PaperProps={paper} />;`,
      output: `${IMPORT}<Dialog slots={{ transition: Fade }} slotProps={{ transition: { timeout: 500 }, paper: paper }} />;`,
      errors: [err('TransitionComponent', 'Dialog'), err('TransitionProps', 'Dialog'), err('PaperProps', 'Dialog')],
    },
    {
      name: 'merges into an existing slotProps object',
      code: `${IMPORT}<TextField slotProps={{ input: { readOnly: true } }} inputProps={{ maxLength: 3 }} />;`,
      output: `${IMPORT}<TextField slotProps={{ input: { readOnly: true }, htmlInput: { maxLength: 3 } }} />;`,
      errors: [err('inputProps', 'TextField')],
    },
    {
      name: 'InputProps and inputProps are different slots',
      code: `${IMPORT}<TextField InputProps={{ startAdornment: a }} inputProps={{ min: 0 }} />;`,
      output: `${IMPORT}<TextField slotProps={{ input: { startAdornment: a }, htmlInput: { min: 0 } }} />;`,
      errors: [err('InputProps', 'TextField'), err('inputProps', 'TextField')],
    },
    {
      name: 'duplicate key with existing slotProps: report only',
      code: `${IMPORT}<TextField slotProps={{ htmlInput: {} }} inputProps={{ min: 0 }} />;`,
      output: null,
      errors: [err('inputProps', 'TextField')],
    },
    {
      name: 'slotProps is not an object literal: report only',
      code: `${IMPORT}<Dialog slotProps={sp} PaperProps={{}} />;`,
      output: null,
      errors: [err('PaperProps', 'Dialog')],
    },
    {
      name: 'components → slots lower-cases keys; componentsProps → slotProps',
      code: `${IMPORT}<Alert components={{ CloseIcon: MyIcon, CloseButton }} componentsProps={{ closeButton: { size: 'large' } }} />;`,
      output: `${IMPORT}<Alert slots={{ closeIcon: MyIcon, closeButton: CloseButton }} slotProps={{ closeButton: { size: 'large' } }} />;`,
      errors: [err('components', 'Alert'), err('componentsProps', 'Alert')],
    },
    {
      name: 'componentsProps given as a variable is spread',
      code: `${IMPORT}<Alert componentsProps={cp} />;`,
      output: `${IMPORT}<Alert slotProps={{ ...cp }} />;`,
      errors: [err('componentsProps', 'Alert')],
    },
    {
      name: 'components as a variable cannot be lower-cased: report only',
      code: `${IMPORT}<Alert components={c} />;`,
      output: null,
      errors: [err('components', 'Alert')],
    },
    {
      name: 'AvatarGroup additionalAvatar → surplus needs a human',
      code: `${IMPORT}<AvatarGroup componentsProps={{ additionalAvatar: {} }} />;`,
      output: null,
      errors: [err('componentsProps', 'AvatarGroup')],
    },
    {
      name: 'nested slot path (actions.previousButton) is reported only',
      code: `${IMPORT}<TablePagination backIconButtonProps={{ disabled: true }} />;`,
      output: null,
      errors: [err('backIconButtonProps', 'TablePagination')],
    },
    {
      name: 'nested input.ref is reported only, and blocks the combined fix',
      code: `${IMPORT}<Checkbox inputProps={{ 'aria-label': 'x' }} inputRef={ref} />;`,
      output: null,
      errors: [err('inputProps', 'Checkbox'), err('inputRef', 'Checkbox')],
    },
    {
      name: 'path import and alias resolve',
      code: "import MuiTooltip from '@mui/material/Tooltip';\n<MuiTooltip title='x' PopperProps={{ disablePortal: true }}><b /></MuiTooltip>;",
      output:
        "import MuiTooltip from '@mui/material/Tooltip';\n<MuiTooltip title='x' slotProps={{ popper: { disablePortal: true } }}><b /></MuiTooltip>;",
      errors: [err('PopperProps', 'Tooltip')],
    },
  ],
});
