/**
 * @fileoverview Plugin shape, configs on real ESLint, and registry
 * completeness (every rule has a doc, a test and annotrace tags).
 * @proves ADR-002 ADR-003
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Linter } = require('eslint');
const plugin = require('../lib');
const pkg = require('../package.json');

const ROOT = path.resolve(__dirname, '..');
const ruleFiles = fs.readdirSync(path.join(ROOT, 'lib/rules')).map((f) => f.replace(/\.js$/, ''));

describe('plugin object', () => {
  it('exposes meta from package.json', () => {
    assert.deepEqual(plugin.meta, { name: pkg.name, version: pkg.version, namespace: 'mui' });
  });

  it('registers exactly the files in lib/rules', () => {
    assert.deepEqual(Object.keys(plugin.rules).sort(), ruleFiles.sort());
  });

  it('gives every rule docs, a docs URL and messages', () => {
    for (const [name, rule] of Object.entries(plugin.rules)) {
      assert.ok(rule.meta.docs.description, name);
      assert.equal(
        rule.meta.docs.url,
        `https://github.com/rkristelijn/eslint-plugin-mui/blob/main/docs/rules/${name}.md`,
      );
      assert.ok(Object.keys(rule.meta.messages).length > 0, name);
    }
  });

  it('keeps deprecated rules out of every config', () => {
    for (const config of Object.values(plugin.configs)) {
      for (const [name, rule] of Object.entries(plugin.rules)) {
        if (rule.meta.deprecated) assert.ok(!(`mui/${name}` in config.rules), `${config.name} has ${name}`);
      }
    }
  });

  it('puts every non-deprecated rule in strict, and only real rules in recommended', () => {
    const live = Object.keys(plugin.rules).filter((n) => !plugin.rules[n].meta.deprecated);
    assert.deepEqual(Object.keys(plugin.configs.strict.rules).sort(), live.map((n) => `mui/${n}`).sort());
    for (const id of Object.keys(plugin.configs.recommended.rules))
      assert.ok(id.replace('mui/', '') in plugin.rules, id);
  });
});

describe('configs on ESLint', () => {
  const code = `import { Grid2, Box } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
export const A = () => <Box mt={2}><Grid2 item xs={12}><Delete /></Grid2></Box>;
`;

  it('recommended lints and fixes MUI v9 issues in one config', () => {
    const linter = new Linter();
    const messages = linter.verify(code, [plugin.configs.recommended], { filename: 'a.js' });
    const ids = new Set(messages.map((m) => m.ruleId));
    for (const id of ['mui/no-removed-imports', 'mui/no-system-props', 'mui/no-legacy-grid'])
      assert.ok(ids.has(id), id);
    assert.ok(
      messages.every((m) => !m.fatal),
      JSON.stringify(messages),
    );

    const { output, messages: rest } = linter.verifyAndFix(code, [plugin.configs.recommended], { filename: 'a.js' });
    assert.equal(
      output,
      `import { Grid, Box } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
export const A = () => <Box sx={{ mt: 2 }}><Grid size={12}><Delete /></Grid></Box>;
`,
    );
    // only the @mui/material barrel remains: it is reported but deliberately not auto-fixed
    assert.deepEqual(
      rest.map((m) => m.ruleId),
      ['mui/prefer-path-imports'],
    );
  });

  it('recommended stays safe on MUI v7: no v9-only advice', () => {
    // nativeButton only exists from MUI v9; following require-native-button on v7 is a TypeScript error (ADR-003).
    assert.ok(!('mui/require-native-button' in plugin.configs.recommended.rules));
    assert.equal(plugin.configs.strict.rules['mui/require-native-button'], 'error');
    const messages = new Linter().verify(
      "import Button from '@mui/material/Button';\nimport Link from 'next/link';\n<Button component={Link} href='/' />;",
      [plugin.configs.recommended],
      { filename: 'a.js' },
    );
    assert.deepEqual(messages, []);
  });

  it('strict also reports the style rules', () => {
    const messages = new Linter().verify("<Box sx={{ color: '#fff', p: '16px' }} />;", [plugin.configs.strict], {
      filename: 'a.js',
    });
    const ids = messages.map((m) => m.ruleId);
    for (const id of ['mui/no-literal-colors', 'mui/no-literal-spacing', 'mui/sort-sx-keys'])
      assert.ok(ids.includes(id), id);
  });
});

describe('registry completeness (annotrace)', () => {
  for (const name of ruleFiles) {
    it(`${name}: @implements, doc with @id, test with @proves`, () => {
      const source = fs.readFileSync(path.join(ROOT, 'lib/rules', `${name}.js`), 'utf8');
      assert.match(source, new RegExp(`@implements[^\\n]*\\bmui-${name}\\b`));
      const doc = fs.readFileSync(path.join(ROOT, 'docs/rules', `${name}.md`), 'utf8');
      assert.match(doc, new RegExp(`@id mui-${name}\\b`));
      const test = fs.readFileSync(path.join(ROOT, 'tests/rules', `${name}.test.js`), 'utf8');
      assert.match(test, new RegExp(`@proves[^\\n]*\\bmui-${name}\\b`));
    });
  }

  it('documents every rule in the README table', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    for (const name of ruleFiles) assert.ok(readme.includes(`docs/rules/${name}.md`), name);
  });
});
