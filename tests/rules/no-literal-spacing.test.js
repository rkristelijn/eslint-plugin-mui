/**
 * @fileoverview Tests for `no-literal-spacing`
 * @proves mui-no-literal-spacing
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-literal-spacing');

const err = (value, suggestions = []) => ({ messageId: 'literalSpacing', data: { value }, suggestions });
const units = (u, output, spacing = '8') => ({ messageId: 'useUnits', data: { units: u, spacing }, output });

createRuleTester().run('no-literal-spacing', rule, {
  valid: [
    '<Box sx={{ p: 2, mt: 1, gap: 0.5 }} />;',
    "<Box sx={{ p: '0px', m: 0 }} />;",
    "<Box sx={{ width: '16px', top: '8px' }} />;",
    "<Box sx={{ p: '1rem', m: 'auto' }} />;",
    "<Box style={{ padding: '16px' }} />;",
    '<Box sx={styles} />;',
  ],
  invalid: [
    {
      name: '|| and ?? entries: both operands can be the style',
      code: "<Box sx={[(dense && { p: '8px' }) || { m: '16px' }, custom ?? { mt: '8px' }]} />;",
      errors: [
        err('8px', [units('1', "<Box sx={[(dense && { p: 1 }) || { m: '16px' }, custom ?? { mt: '8px' }]} />;")]),
        err('16px', [units('2', "<Box sx={[(dense && { p: '8px' }) || { m: 2 }, custom ?? { mt: '8px' }]} />;")]),
        err('8px', [units('1', "<Box sx={[(dense && { p: '8px' }) || { m: '16px' }, custom ?? { mt: 1 }]} />;")]),
      ],
    },
    {
      code: "<Box sx={{ padding: '16px' }} />;",
      errors: [err('16px', [units('2', '<Box sx={{ padding: 2 }} />;')])],
    },
    {
      name: 'half units are still exact',
      code: "<Box sx={{ mt: '4px' }} />;",
      errors: [err('4px', [units('0.5', '<Box sx={{ mt: 0.5 }} />;')])],
    },
    {
      name: 'no suggestion when the value is off the scale',
      code: "<Box sx={{ mb: '5px' }} />;",
      errors: [err('5px')],
    },
    {
      name: 'multi-value shorthand is reported without suggestion',
      code: "<Box sx={{ margin: '8px 16px' }} />;",
      errors: [err('8px 16px')],
    },
    {
      name: 'responsive object and array values',
      code: "<Box sx={{ p: { xs: '8px', md: 2 }, m: ['16px', 1] }} />;",
      errors: [
        err('8px', [units('1', "<Box sx={{ p: { xs: 1, md: 2 }, m: ['16px', 1] }} />;")]),
        err('16px', [units('2', "<Box sx={{ p: { xs: '8px', md: 2 }, m: [2, 1] }} />;")]),
      ],
    },
    {
      name: 'nested selectors and sx arrays',
      code: "<Box sx={[{ '&:hover': { px: '24px' } }, cond && { gap: '8px' }]} />;",
      errors: [
        err('24px', [units('3', "<Box sx={[{ '&:hover': { px: 3 } }, cond && { gap: '8px' }]} />;")]),
        // conditional sx entries are walked too (CodeRabbit review on PR #6)
        err('8px', [units('1', "<Box sx={[{ '&:hover': { px: '24px' } }, cond && { gap: 1 }]} />;")]),
      ],
    },
    {
      name: 'ternary sx entry and ternary value',
      code: "<Box sx={[dense ? { p: '8px' } : {}, { m: big ? '16px' : 1 }]} />;",
      errors: [
        err('8px', [units('1', "<Box sx={[dense ? { p: 1 } : {}, { m: big ? '16px' : 1 }]} />;")]),
        err('16px', [units('2', "<Box sx={[dense ? { p: '8px' } : {}, { m: big ? 2 : 1 }]} />;")]),
      ],
    },
    {
      name: 'custom spacing base',
      code: "<Box sx={{ p: '20px' }} />;",
      options: [{ spacing: 4 }],
      errors: [err('20px', [units('5', '<Box sx={{ p: 5 }} />;', '4')])],
    },
  ],
});
