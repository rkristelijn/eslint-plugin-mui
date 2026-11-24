/**
 * @fileoverview Tests for `icon-button-aria-label`
 * @proves mui-icon-button-aria-label
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/icon-button-aria-label');

const IMPORT =
  "import { IconButton, Tooltip } from '@mui/material';\nimport Delete from '@mui/icons-material/Delete';\n";

createRuleTester().run('icon-button-aria-label', rule, {
  valid: [
    `${IMPORT}<IconButton aria-label="delete"><Delete /></IconButton>;`,
    `${IMPORT}<IconButton aria-labelledby="lbl"><Delete /></IconButton>;`,
    `${IMPORT}<Tooltip title="Delete"><IconButton><Delete /></IconButton></Tooltip>;`,
    `${IMPORT}<IconButton>Close</IconButton>;`,
    // spread may carry the label
    `${IMPORT}<IconButton {...props}><Delete /></IconButton>;`,
    // not MUI
    '<IconButton><Delete /></IconButton>;',
  ],
  invalid: [
    {
      code: `${IMPORT}<IconButton onClick={remove}><Delete /></IconButton>;`,
      errors: [{ messageId: 'missingLabel', data: { name: 'IconButton' } }],
    },
    {
      name: 'self-closing',
      code: `${IMPORT}<IconButton />;`,
      errors: [{ messageId: 'missingLabel', data: { name: 'IconButton' } }],
    },
    {
      name: 'a Tooltip without title does not name it',
      code: `${IMPORT}<Tooltip><IconButton><Delete /></IconButton></Tooltip>;`,
      errors: [{ messageId: 'missingLabel', data: { name: 'IconButton' } }],
    },
    {
      name: 'a non-MUI Tooltip does not count',
      code: "import IB from '@mui/material/IconButton';\nimport { Tooltip } from 'other';\n<Tooltip title='x'><IB /></Tooltip>;",
      errors: [{ messageId: 'missingLabel', data: { name: 'IB' } }],
    },
    {
      name: 'title alone is not relied on',
      code: `${IMPORT}<IconButton title="delete"><Delete /></IconButton>;`,
      errors: [{ messageId: 'missingLabel', data: { name: 'IconButton' } }],
    },
  ],
});
