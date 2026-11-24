/**
 * @fileoverview Disallow the 23 legacy `*Outline` icons removed in MUI v9 and
 * replace them with the icon that looks the same.
 * @implements mui-no-removed-icons
 * @see https://mui.com/material-ui/migration/upgrade-to-v9/#material-icons
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { importedName } = require('../utils/mui');
const { REMOVED_ICONS } = require('../data/removed');

const ICONS = '@mui/icons-material';
const PATH_RE = /^@mui\/icons-material\/([^/]+)$/;

/**
 * Is `name` one of the removed icons?
 * @param {string} name
 * @returns {boolean}
 */
function isRemovedIcon(name) {
  return Object.prototype.hasOwnProperty.call(REMOVED_ICONS, name);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow `*Outline` icons removed in MUI v9; autofix to the same-looking icon',
      recommended: true,
      url: docsUrl('no-removed-icons'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      removedIcon: "Icon '{{name}}' was removed in MUI v9. Use '{{replacement}}' (same appearance).",
      removedIconNoReplacement:
        "Icon '{{name}}' was removed in MUI v9 and has no identical replacement. The closest is '{{name}}Outlined'; to keep the old design, copy its v7 SVG path into `createSvgIcon`.",
    },
  },

  create(context) {
    /**
     * @param {object} node node to report
     * @param {string} name removed icon name
     * @param {(fixer: object, replacement: string) => object} fix
     */
    function report(node, name, fix) {
      const replacement = REMOVED_ICONS[name];
      if (replacement === null) {
        context.report({ node, messageId: 'removedIconNoReplacement', data: { name } });
        return;
      }
      context.report({
        node,
        messageId: 'removedIcon',
        data: { name, replacement },
        fix: (fixer) => fix(fixer, replacement),
      });
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        const path = PATH_RE.exec(source);
        if (path && isRemovedIcon(path[1])) {
          report(node.source, path[1], (fixer, replacement) =>
            fixer.replaceText(node.source, `'${ICONS}/${replacement}'`),
          );
          return;
        }
        if (source !== ICONS) return;
        for (const spec of node.specifiers) {
          if (spec.type !== 'ImportSpecifier' || !isRemovedIcon(importedName(spec))) continue;
          report(spec, importedName(spec), (fixer, replacement) =>
            fixer.replaceText(spec, `${replacement} as ${spec.local.name}`),
          );
        }
      },
    };
  },
};
