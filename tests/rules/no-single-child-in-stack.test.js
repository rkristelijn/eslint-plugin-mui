/**
 * @fileoverview Tests for `no-single-child-in-stack`
 * @proves mui-no-single-child-in-stack
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-single-child-in-stack');

createRuleTester().run('no-single-child-in-stack', rule, {
  valid: [
    "import { Stack } from '@mui/material';\nconst A = () => <Stack><a /><b /></Stack>;",
    "import { Stack } from '@mui/material';\nconst A = () => <Stack>{items.map((i) => <a key={i} />)}</Stack>;",
    "import { Stack } from '@mui/material';\nconst A = () => <Stack>{cond && <a />}</Stack>;",
    "import Stack from '@mui/material/Stack';\nconst A = () => <Stack spacing={2}><a />text</Stack>;",
    // not MUI
    "import { Stack } from 'other-lib';\nconst A = () => <Stack><a /></Stack>;",
    'const A = () => <Stack><a /></Stack>;',
  ],
  invalid: [
    {
      code: "import { Stack, Typography } from '@mui/material';\nconst A = () => <Stack><Typography>foo</Typography></Stack>;",
      errors: [{ messageId: 'singleChild', data: { name: 'Stack' } }],
    },
    {
      name: 'path import from @mui/material',
      code: "import Stack from '@mui/material/Stack';\nconst A = () => <Stack spacing={1}>\n  <span />\n</Stack>;",
      errors: [{ messageId: 'singleChild' }],
    },
    {
      name: '@mui/system Stack',
      code: "import { Stack } from '@mui/system';\nconst A = () => <Stack>just text</Stack>;",
      errors: [{ messageId: 'singleChild' }],
    },
  ],
});
