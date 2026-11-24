/**
 * @fileoverview Tests for `no-system-props`
 * @proves mui-no-system-props
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-system-props');

const IMPORT = "import { Box, Stack, Typography, Link, Grid, Button } from '@mui/material';\n";
const err = (prop, component) => ({ messageId: 'systemProp', data: { prop, component } });

createRuleTester().run('no-system-props', rule, {
  valid: [
    `${IMPORT}<Box sx={{ mt: 2 }} />;`,
    // own props that share a system-prop name
    `${IMPORT}<Typography color="text.secondary" variant="body2" />;`,
    `${IMPORT}<Link color="inherit" href="/" />;`,
    `${IMPORT}<Stack spacing={2} direction="row" />;`,
    `${IMPORT}<Grid container spacing={2} size={6} />;`,
    // Button is not a system-props component
    `${IMPORT}<Button color="primary" />;`,
    // not MUI
    '<Box mt={2} />;',
    "import { Box } from 'other';\n<Box mt={2} />;",
    // ignore option
    { code: `${IMPORT}<Box component="img" width={100} />;`, options: [{ ignore: ['width'] }] },
  ],
  invalid: [
    {
      name: 'no sx yet: props become a new sx',
      code: `${IMPORT}<Box mt={2} color="primary.main" />;`,
      output: `${IMPORT}<Box sx={{ mt: 2, color: "primary.main" }} />;`,
      errors: [err('mt', 'Box'), err('color', 'Box')],
    },
    {
      name: 'existing sx object: props are appended',
      code: `${IMPORT}<Stack sx={{ p: 1 }} alignItems="center" spacing={2} />;`,
      output: `${IMPORT}<Stack sx={{ p: 1, alignItems: "center" }} spacing={2} />;`,
      errors: [err('alignItems', 'Stack')],
    },
    {
      name: 'empty sx object',
      code: `${IMPORT}<Box sx={{}} display="flex" />;`,
      output: `${IMPORT}<Box sx={{ display: "flex" }} />;`,
      errors: [err('display', 'Box')],
    },
    {
      name: 'Typography keeps color but moves fontWeight',
      code: `${IMPORT}<Typography color="error" fontWeight="bold" mt={1}>x</Typography>;`,
      output: `${IMPORT}<Typography color="error" sx={{ fontWeight: "bold", mt: 1 }}>x</Typography>;`,
      errors: [err('fontWeight', 'Typography'), err('mt', 'Typography')],
    },
    {
      name: 'expression values are moved verbatim',
      code: `${IMPORT}<Grid size={6} mr={theme.spacing(1)} />;`,
      output: `${IMPORT}<Grid size={6} sx={{ mr: theme.spacing(1) }} />;`,
      errors: [err('mr', 'Grid')],
    },
    {
      name: 'sx that is not an object literal: report only',
      code: `${IMPORT}<Box sx={styles} mt={2} />;`,
      output: null,
      errors: [err('mt', 'Box')],
    },
    {
      name: 'duplicate key in sx: report only',
      code: `${IMPORT}<Box sx={{ mt: 1 }} mt={2} />;`,
      output: null,
      errors: [err('mt', 'Box')],
    },
    {
      name: '@mui/system Box and path import',
      code: "import { Box } from '@mui/system';\nimport Typo from '@mui/material/Typography';\n<><Box p={1} /><Typo m={0} /></>;",
      output:
        "import { Box } from '@mui/system';\nimport Typo from '@mui/material/Typography';\n<><Box sx={{ p: 1 }} /><Typo sx={{ m: 0 }} /></>;",
      errors: [err('p', 'Box'), err('m', 'Typography')],
    },
    {
      name: 'bare boolean system prop becomes true',
      code: `${IMPORT}<Box flex />;`,
      output: `${IMPORT}<Box sx={{ flex: true }} />;`,
      errors: [err('flex', 'Box')],
    },
  ],
});
