/**
 * @fileoverview Tests for `prefer-path-imports`
 * @proves mui-prefer-path-imports
 */

'use strict';

const { createRuleTester, tsx } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/prefer-path-imports');

createRuleTester().run('prefer-path-imports', rule, {
  valid: [
    "import Button from '@mui/material/Button';",
    "import Delete from '@mui/icons-material/Delete';",
    "import { createTheme } from '@mui/material/styles';",
    // side-effect import has no specifiers
    "import '@mui/material';",
    // unwatched package by default
    "import { Box } from '@mui/system';",
    // option narrows the watched packages
    { code: "import { Button } from '@mui/material';", options: [{ packages: ['@mui/icons-material'] }] },
    "import { Button } from 'other';",
    // type-only imports cost nothing at runtime
    { code: "import type { ButtonProps } from '@mui/material';", languageOptions: tsx },
    { code: "import { type SvgIconComponent } from '@mui/icons-material';", languageOptions: tsx },
  ],
  invalid: [
    {
      name: 'icons barrel → per-icon default imports (aliases kept)',
      code: "import { Delete, Close as CloseIcon } from '@mui/icons-material';",
      output: "import Delete from '@mui/icons-material/Delete';\nimport CloseIcon from '@mui/icons-material/Close';",
      errors: [{ messageId: 'barrelIcons', data: { example: 'Delete' } }],
    },
    {
      name: 'indentation of the original import is kept',
      code: "  import { Add, Remove } from '@mui/icons-material';",
      output: "  import Add from '@mui/icons-material/Add';\n  import Remove from '@mui/icons-material/Remove';",
      errors: [{ messageId: 'barrelIcons' }],
    },
    {
      name: 'namespace import is reported but not fixable',
      code: "import * as Icons from '@mui/icons-material';",
      output: null,
      errors: [{ messageId: 'barrelIcons' }],
    },
    {
      name: '@mui/material barrel is reported without autofix (non-components live elsewhere)',
      code: "import { Button, TextField } from '@mui/material';",
      output: null,
      errors: [{ messageId: 'barrel', data: { source: '@mui/material' } }],
    },
    {
      name: 'opt-in package via options',
      code: "import { Box } from '@mui/system';",
      options: [{ packages: ['@mui/system'] }],
      output: null,
      errors: [{ messageId: 'barrel', data: { source: '@mui/system' } }],
    },
  ],
});
