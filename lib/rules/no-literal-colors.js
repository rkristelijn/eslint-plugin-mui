/**
 * @fileoverview Rule to disallow literal color values in MUI `sx` prop
 * @author rkristelijn
 * @implements mui-no-literal-colors
 */

'use strict';

const { docsUrl } = require('../utils/meta');

const namedColors = new Set([
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
]);

/** sx keys that take a color. */
const COLOR_KEYS = new Set([
  'color',
  'bgcolor',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'fill',
  'stroke',
]);

/** #rgb, #rgba, #rrggbb, #rrggbbaa */
const HEX_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
const COLOR_FUNCTION_RE = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;

/**
 * Static key name of a property (`color`, `'color'`).
 * @param {object} node Property
 * @returns {string | null}
 */
function getKeyName(node) {
  if (node.computed) return null;
  if (node.key.type === 'Identifier') return node.key.name;
  return node.key.type === 'Literal' ? String(node.key.value) : null;
}
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow literal color values in MUI `sx` prop',
      recommended: false,
      url: docsUrl('no-literal-colors'),
    },
    schema: [],
    messages: {
      noLiteralColors: "Literal color value '{{value}}' is not allowed in 'sx' prop.",
    },
  },

  create(context) {
    // If the object is inside of an `sx` attribute
    let isInSx = false;

    return {
      JSXAttribute(node) {
        isInSx = !!node.name && node.name.name === 'sx';
      },

      'JSXAttribute:exit'() {
        isInSx = false;
      },

      Property(node) {
        if (!isInSx || !COLOR_KEYS.has(getKeyName(node))) {
          return;
        }

        if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
          const colorValue = node.value.value.trim().toLowerCase();
          if (HEX_RE.test(colorValue) || COLOR_FUNCTION_RE.test(colorValue) || namedColors.has(colorValue)) {
            context.report({
              node: node.value,
              messageId: 'noLiteralColors',
              data: {
                value: colorValue,
              },
            });
          }
        }
      },
    };
  },
};
