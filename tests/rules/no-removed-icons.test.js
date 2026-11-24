/**
 * @fileoverview Tests for `no-removed-icons`
 * @proves mui-no-removed-icons
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-removed-icons');
const { REMOVED_ICONS } = require('../../lib/data/removed');

createRuleTester().run('no-removed-icons', rule, {
  valid: [
    "import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';",
    "import InfoOutlined from '@mui/icons-material/InfoOutlined';",
    // theme variants of the removed icons were not removed
    "import InfoOutlineRounded from '@mui/icons-material/InfoOutlineRounded';",
    "import { DeleteOutlineSharp } from '@mui/icons-material';",
    "import { ErrorOutline } from 'other-icons';",
  ],
  invalid: [
    {
      name: 'path import: same-looking OutlineOutlined icon',
      code: "import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';",
      output: "import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';",
      errors: [{ messageId: 'removedIcon', data: { name: 'ErrorOutline', replacement: 'ErrorOutlineOutlined' } }],
    },
    {
      name: 'icons without an OutlineOutlined variant use Outlined',
      code: "import InfoOutlineIcon from '@mui/icons-material/InfoOutline';",
      output: "import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';",
      errors: [{ messageId: 'removedIcon', data: { name: 'InfoOutline', replacement: 'InfoOutlined' } }],
    },
    {
      name: 'ModeEditOutline was a filled pencil → ModeEdit',
      code: "import { ModeEditOutline, Add } from '@mui/icons-material';",
      output: "import { ModeEdit as ModeEditOutline, Add } from '@mui/icons-material';",
      errors: [{ messageId: 'removedIcon', data: { name: 'ModeEditOutline', replacement: 'ModeEdit' } }],
    },
    {
      name: 'barrel alias keeps the local name',
      code: "import { HelpOutline as Help } from '@mui/icons-material';",
      output: "import { HelpOutlineOutlined as Help } from '@mui/icons-material';",
      errors: [{ messageId: 'removedIcon' }],
    },
    {
      name: 'PeopleOutline has no identical replacement',
      code: "import PeopleOutline from '@mui/icons-material/PeopleOutline';",
      output: null,
      errors: [{ messageId: 'removedIconNoReplacement', data: { name: 'PeopleOutline' } }],
    },
    // every entry of the data table is detected
    ...Object.keys(REMOVED_ICONS).map((name) => ({
      name: `table entry ${name}`,
      code: `import X from '@mui/icons-material/${name}';`,
      output: REMOVED_ICONS[name] ? `import X from '@mui/icons-material/${REMOVED_ICONS[name]}';` : null,
      errors: 1,
    })),
  ],
});
