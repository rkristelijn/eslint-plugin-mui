/**
 * @fileoverview Tests for `require-native-button`
 * @proves mui-require-native-button
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/require-native-button');
const { BUTTON_LIKE } = require('../../lib/data/system');

const IMPORT = "import { Button, IconButton, MenuItem, Box } from '@mui/material';\nimport Link from 'next/link';\n";
const err = (component) => ({ messageId: 'missingNativeButton', data: { component } });

createRuleTester().run('require-native-button', rule, {
  valid: [
    `${IMPORT}<Button>ok</Button>;`,
    `${IMPORT}<Button component={Link} nativeButton={false} href="/">ok</Button>;`,
    `${IMPORT}<Button component={CustomButton} nativeButton>ok</Button>;`,
    // HTML tag strings are resolved by MUI itself
    `${IMPORT}<Button component="a" href="/">ok</Button>;`,
    `${IMPORT}<Button component={'span'}>ok</Button>;`,
    // spread may carry nativeButton
    `${IMPORT}<Button component={Link} {...props}>ok</Button>;`,
    // Box is not button-like
    `${IMPORT}<Box component={Link} />;`,
    // not MUI
    '<Button component={Link} />;',
  ],
  invalid: [
    { code: `${IMPORT}<Button component={Link} href="/">ok</Button>;`, errors: [err('Button')] },
    { code: `${IMPORT}<IconButton component={RouterLink} aria-label="x" />;`, errors: [err('IconButton')] },
    { code: `${IMPORT}<MenuItem component={forwardRef(Item)} />;`, errors: [err('MenuItem')] },
    {
      name: 'path import',
      code: "import Tab from '@mui/material/Tab';\n<Tab component={NavLink} />;",
      errors: [err('Tab')],
    },
    // every button-like component from the v9 list is covered
    ...[...BUTTON_LIKE].map((component) => ({
      name: `button-like ${component}`,
      code: `import { ${component} } from '@mui/material';\n<${component} component={X} />;`,
      errors: [err(component)],
    })),
  ],
});
