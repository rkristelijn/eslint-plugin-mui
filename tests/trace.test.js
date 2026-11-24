/**
 * @fileoverview annotrace gate: the analyser catches every gap class on a
 * fixture repo, and this repo itself passes --strict.
 * @proves ADR-005
 */

'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { analyse, harvest } = require('../scripts/trace');

/**
 * Write a file tree under `root`.
 * @param {string} root
 * @param {Record<string, string>} files
 */
function writeTree(root, files) {
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  }
}

/** Build a tag at runtime so the fixture text is not harvested from this file itself. */
const tag = (verb) => `@${verb}`;

describe('trace analyser', () => {
  let root;
  before(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-'));
    writeTree(root, {
      'docs/rules/ok.md': '<!-- @id mui-ok -->',
      'docs/rules/untested.md': '<!-- @id mui-untested -->',
      'docs/rules/orphan.md': '<!-- @id mui-orphan -->',
      'docs/adr/adr-001.md': '@id ADR-001\n**Coverage**: none',
      'docs/adr/adr-002.md':
        '@id ADR-002\n@id ADR-002\nExample in code: `@id not-a-declaration` and\n```\n@id also-not\n```',
      'lib/rules/ok.js': `// ${tag('implements')} mui-ok ADR-002`,
      'lib/rules/untested.js': `// ${tag('implements')} mui-untested mui-ghost`,
      'tests/ok.test.js': `// ${tag('proves')} mui-ok mui-orphan mui-missing`,
    });
  });
  after(() => fs.rmSync(root, { recursive: true, force: true }));

  it('finds duplicates, dead links, orphans and untested rules, and ignores code examples', () => {
    const { errors, concepts } = analyse(harvest(root));
    assert.deepEqual(concepts.map((c) => c.id).sort(), ['ADR-001', 'ADR-002', 'mui-ok', 'mui-orphan', 'mui-untested']);
    const kinds = errors.map((e) => e.split(' (')[0].split(' in ')[0]);
    assert.deepEqual(kinds.sort(), [
      `dead link ${tag('implements')} mui-ghost`,
      `dead link ${tag('proves')} mui-missing`,
      'duplicate @id ADR-002',
      'orphan decision mui-orphan',
      'untested rule mui-untested',
    ]);
  });

  it('exempts Coverage: none from the code requirement', () => {
    const { errors } = analyse(harvest(root));
    assert.ok(!errors.some((e) => e.includes('ADR-001')));
  });
});

describe('this repository', () => {
  it('passes trace --strict with zero errors', () => {
    const out = execFileSync(process.execPath, [path.join(__dirname, '../scripts/trace.js'), '--strict', '--json'], {
      encoding: 'utf8',
    });
    const report = JSON.parse(out);
    assert.deepEqual(report.errors, []);
    assert.ok(report.concepts.length >= 18);
  });
});
