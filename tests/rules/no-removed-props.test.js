/**
 * @fileoverview Tests for `no-removed-props`
 * @proves mui-no-removed-props
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-removed-props');
const { REMOVED_PROPS } = require('../../lib/data/removed');

const err = (component, prop) => ({
  messageId: 'removedProp',
  data: { prop, component, since: REMOVED_PROPS[component][prop].since, hint: REMOVED_PROPS[component][prop].hint },
});
const IMPORT = "import { Dialog, Modal, Divider, Typography, InputLabel, Autocomplete } from '@mui/material';\n";

createRuleTester().run('no-removed-props', rule, {
  valid: [
    `${IMPORT}<Dialog open onClose={close} />;`,
    `${IMPORT}<InputLabel size="small" />;`,
    `${IMPORT}<InputLabel size="medium" />;`,
    `${IMPORT}<Autocomplete renderValue={render} />;`,
    `${IMPORT}<Divider sx={{ opacity: 0.6 }} />;`,
    // not MUI
    '<Dialog disableEscapeKeyDown />;',
  ],
  invalid: [
    {
      code: `${IMPORT}<Dialog open disableEscapeKeyDown onClose={close} />;`,
      output: null,
      errors: [err('Dialog', 'disableEscapeKeyDown')],
    },
    {
      code: `${IMPORT}<Modal onBackdropClick={f} disableEscapeKeyDown={true} />;`,
      output: null,
      errors: [err('Modal', 'onBackdropClick'), err('Modal', 'disableEscapeKeyDown')],
    },
    {
      name: 'Divider light → sx opacity',
      code: `${IMPORT}<Divider light />;`,
      output: `${IMPORT}<Divider sx={{ opacity: 0.6 }} />;`,
      errors: [err('Divider', 'light')],
    },
    {
      name: 'Divider light merges into existing sx',
      code: `${IMPORT}<Divider sx={{ my: 1 }} light />;`,
      output: `${IMPORT}<Divider sx={{ my: 1, opacity: 0.6 }} />;`,
      errors: [err('Divider', 'light')],
    },
    {
      name: 'dynamic light value: report only',
      code: `${IMPORT}<Divider light={isLight} />;`,
      output: null,
      errors: [err('Divider', 'light')],
    },
    {
      name: 'Typography paragraph → sx marginBottom',
      code: `${IMPORT}<Typography paragraph>x</Typography>;`,
      output: `${IMPORT}<Typography sx={{ marginBottom: '16px' }}>x</Typography>;`,
      errors: [err('Typography', 'paragraph')],
    },
    {
      name: 'InputLabel size="normal" → "medium"',
      code: `${IMPORT}<InputLabel size="normal" />;\n<InputLabel size={'normal'} />;`,
      output: `${IMPORT}<InputLabel size="medium" />;\n<InputLabel size="medium" />;`,
      errors: [err('InputLabel', 'size'), err('InputLabel', 'size')],
    },
    {
      name: 'Autocomplete renderTags → renderValue',
      code: `${IMPORT}<Autocomplete multiple renderTags={(v, getTagProps) => null} />;`,
      output: `${IMPORT}<Autocomplete multiple renderValue={(v, getTagProps) => null} />;`,
      errors: [err('Autocomplete', 'renderTags')],
    },
  ],
});
