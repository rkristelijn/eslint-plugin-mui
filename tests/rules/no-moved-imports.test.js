/**
 * @fileoverview Tests for `no-moved-imports`
 * @proves mui-no-moved-imports
 */

'use strict';

const { createRuleTester, tsx } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-moved-imports');

createRuleTester().run('no-moved-imports', rule, {
  valid: [
    "import { Alert } from '@mui/material';",
    "import Alert from '@mui/material/Alert';",
    "import { LoadingButton, TabContext } from '@mui/lab';",
    "import TabContext from '@mui/lab/TabContext';",
    "import { StyledEngineProvider } from '@mui/material/styles';",
    "import { Alert } from 'other-lib';",
  ],
  invalid: [
    {
      name: 'all specifiers moved: switch the source',
      code: "import { Alert, Skeleton as Bone } from '@mui/lab';",
      output: "import { Alert, Skeleton as Bone } from '@mui/material';",
      errors: [{ messageId: 'moved', data: { names: "Alert', 'Skeleton", from: '@mui/lab', to: '@mui/material' } }],
    },
    {
      name: 'mixed: split into what stays and what moved',
      code: "import { TabContext, Rating } from '@mui/lab';",
      output: "import { TabContext } from '@mui/lab';\nimport { Rating } from '@mui/material';",
      errors: [{ messageId: 'moved', data: { names: 'Rating', from: '@mui/lab', to: '@mui/material' } }],
    },
    {
      name: 'path import',
      code: "import ToggleButton from '@mui/lab/ToggleButton';",
      output: "import ToggleButton from '@mui/material/ToggleButton';",
      errors: [{ messageId: 'moved', data: { names: 'ToggleButton', from: '@mui/lab', to: '@mui/material' } }],
    },
    {
      name: 'StyledEngineProvider left the @mui/material barrel',
      code: "import { Button, StyledEngineProvider } from '@mui/material';",
      output: "import { Button } from '@mui/material';\nimport { StyledEngineProvider } from '@mui/material/styles';",
      errors: [
        {
          messageId: 'moved',
          data: { names: 'StyledEngineProvider', from: '@mui/material', to: '@mui/material/styles' },
        },
      ],
    },
    {
      name: 'type-only import stays type-only after the move',
      code: "import type { Alert } from '@mui/lab';",
      output: "import type { Alert } from '@mui/material';",
      languageOptions: tsx,
      errors: [{ messageId: 'moved' }],
    },
    {
      name: 'default + named cannot be split safely: report only',
      code: "import Lab, { Alert } from '@mui/lab';",
      output: null,
      errors: [{ messageId: 'moved' }],
    },
  ],
});
