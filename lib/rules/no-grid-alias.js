/**
 * @fileoverview Disallow aliasing MUI Grid imports (`Grid2 as Grid`,
 * `GridLegacy as Grid`): an alias hides which Grid API a file uses.
 * Autofix renames the binding and every reference (scope-aware).
 * @implements mui-no-grid-alias
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { importedName, isMuiSource } = require('../utils/mui');

const GRID_EXPORTS = new Set(['Grid', 'Grid2', 'Unstable_Grid2', 'GridLegacy']);

/**
 * Is a variable with this name declared in the scope or any parent?
 * @param {object} scope
 * @param {string} name
 * @returns {boolean}
 */
function isNameTaken(scope, name) {
  for (let current = scope; current; current = current.upper) {
    if (current.set.has(name)) return true;
  }
  return false;
}

/**
 * Find the variable a name resolves to from a given scope.
 * @param {object} scope
 * @param {string} name
 * @returns {object | null}
 */
function resolveVariable(scope, name) {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) return variable;
  }
  return null;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow renaming MUI Grid imports (`Grid2 as Grid`, `GridLegacy as Grid`)',
      recommended: true,
      url: docsUrl('no-grid-alias'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      noAlias: "Do not import '{{imported}}' as '{{local}}'; keep the real name so it is clear which Grid API is used.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const aliases = [];
    const jsxNames = [];

    return {
      ImportDeclaration(node) {
        if (!isMuiSource(node.source.value)) return;
        for (const spec of node.specifiers) {
          if (spec.type !== 'ImportSpecifier') continue;
          const imported = importedName(spec);
          if (GRID_EXPORTS.has(imported) && spec.local.name !== imported) aliases.push({ spec, imported });
        }
      },

      'JSXOpeningElement, JSXClosingElement'(node) {
        if (node.name.type === 'JSXIdentifier') jsxNames.push(node.name);
      },

      'Program:exit'() {
        for (const { spec, imported } of aliases) {
          const local = spec.local.name;
          const [variable] = sourceCode.getDeclaredVariables(spec);
          const moduleScope = sourceCode.getScope(spec);
          const refs = variable ? variable.references.map((ref) => ref.identifier) : [];
          const jsxRefs = jsxNames.filter(
            (name) => name.name === local && resolveVariable(sourceCode.getScope(name), local) === variable,
          );
          const isShorthandUse = refs.some((id) => id.parent.type === 'Property' && id.parent.shorthand);
          // Renaming must not be captured by another binding of the target name anywhere a reference lives.
          const isCaptured = [...refs, ...jsxRefs].some((id) => resolveVariable(sourceCode.getScope(id), imported));
          const isFixable = variable && !isNameTaken(moduleScope, imported) && !isShorthandUse && !isCaptured;

          context.report({
            node: spec,
            messageId: 'noAlias',
            data: { imported, local },
            fix: isFixable
              ? (fixer) => [
                  fixer.replaceText(spec, imported),
                  ...[...new Set([...refs, ...jsxRefs])].map((id) => fixer.replaceText(id, imported)),
                ]
              : null,
          });
        }
      },
    };
  },
};
