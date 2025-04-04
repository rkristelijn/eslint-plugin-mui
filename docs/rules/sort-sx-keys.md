# require MUI `sx` keys to be sorted (sort-sx-keys)

Some developers prefer to sort CSS properties by group or alphabetically to more easily find and/or diff necessary
properties at a later time. Others feel that it adds complexity and becomes burden to maintain.

## Rule Details

This rule checks all CSS property definitions of object expressions inside of an `sx` attribute and verifies that all
variables are sorted accordingly.

Examples of **incorrect** code for this rule:

```js
const Header = (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50px',
      width: '100%',
      margin: 0,
      padding: '16px',
    }}
  />
);
```

Examples of **correct** code for this rule:

```js
const Header = (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      width: '100%',
      height: '50px',
      margin: 0,
      padding: '16px',
    }}
  />
);
```

### Options

```json
{
  "sort-keys": [
    "error",
    "custom",
    [
      "all",
      "position",
      "zIndex",
      "top",
      "right",
      "bottom",
      "left",
      "float",
      "clear",
      "display",
      "displayPrint",
      "displayRaw",
      "visibility",
      "backfaceVisibility",
      "flex",
      "flexGrow",
      "flexShrink",
      "flexBasis",
      "flexFlow",
      "flexDirection",
      "flexWrap",
      "grid",
      "gridTemplate",
      "gridTemplateRows",
      "gridTemplateColumns",
      "gridTemplateAreas",
      "gridAutoRows",
      "gridAutoColumns",
      "gridAutoFlow",
      "gridArea",
      "gridRow",
      "gridRowStart",
      "gridRowEnd",
      "gridColumn",
      "gridColumnStart",
      "gridColumnEnd",
      "gap",
      "rowGap",
      "columnGap",
      "columns",
      "columnWidth",
      "columnCount",
      "columnRule",
      "columnRuleWidth",
      "columnRuleStyle",
      "columnRuleColor",
      "columnFill",
      "columnSpan",
      "justifyContent",
      "justifyItems",
      "justifySelf",
      "alignContent",
      "alignItems",
      "alignSelf",
      "order",
      "verticalAlign",
      "isolation",
      "boxSizing",
      "width",
      "minWidth",
      "maxWidth",
      "height",
      "minHeight",
      "maxHeight",
      "overflow",
      "overflowX",
      "overflowY",
      "resize",
      "m",
      "mt",
      "mr",
      "mb",
      "ml",
      "my",
      "mx",
      "margin",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "marginY",
      "marginX",
      "p",
      "pt",
      "pr",
      "pb",
      "pl",
      "py",
      "px",
      "padding",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "paddingY",
      "paddingX",
      "boxDecorationBreak",
      "boxShadow",
      "outline",
      "outlineWidth",
      "outlineStyle",
      "outlineColor",
      "outlineOffset",
      "border",
      "borderTop",
      "borderRight",
      "borderBottom",
      "borderLeft",
      "borderWidth",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderStyle",
      "borderTopStyle",
      "borderRightStyle",
      "borderBottomStyle",
      "borderLeftStyle",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "borderRadius",
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomRightRadius",
      "borderBottomLeftRadius",
      "borderImage",
      "borderImageSource",
      "borderImageSlice",
      "borderImageWidth",
      "borderImageOutset",
      "borderImageRepeat",
      "background",
      "backgroundColor",
      "backgroundImage",
      "backgroundPosition",
      "backgroundSize",
      "backgroundRepeat",
      "backgroundOrigin",
      "backgroundClip",
      "backgroundAttachment",
      "backgroundBlendMode",
      "mixBlendMode",
      "bgcolor",
      "color",
      "opacity",
      "imageRendering",
      "clipPath",
      "filter",
      "mask",
      "maskType",
      "objectFit",
      "objectPosition",
      "listStyle",
      "listStyleType",
      "listStylePosition",
      "listStyleImage",
      "tableLayout",
      "borderCollapse",
      "borderSpacing",
      "emptyCells",
      "captionSide",
      "pointerEvents",
      "cursor",
      "perspective",
      "perspectiveOrigin",
      "transform",
      "transformOrigin",
      "transformStyle",
      "transition",
      "transitionProperty",
      "transitionDuration",
      "transitionTimingFunction",
      "transitionDelay",
      "animation",
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationDelay",
      "animationIterationCount",
      "animationDirection",
      "animationFillMode",
      "animationPlayState",
      "direction",
      "unicodeBidi",
      "writingMode",
      "textOrientation",
      "textAlign",
      "textAlignLast",
      "textJustify",
      "textIndent",
      "tabSize",
      "lineHeight",
      "lineBreak",
      "wordSpacing",
      "wordBreak",
      "letterSpacing",
      "whiteSpace",
      "textOverflow",
      "overflowWrap",
      "wordWrap",
      "textShadow",
      "textDecoration",
      "textDecorationLine",
      "textDecorationColor",
      "textDecorationStyle",
      "textUnderlinePosition",
      "caretColor",
      "userSelect",
      "textTransform",
      "textCombineUpright",
      "hangingPunctuation",
      "hyphens",
      "quotes",
      "typography",
      "font",
      "fontStyle",
      "fontVariant",
      "fontVariantAlternates",
      "fontVariantCaps",
      "fontVariantEastAsian",
      "fontVariantLigatures",
      "fontVariantNumeric",
      "fontVariantPosition",
      "fontWeight",
      "fontSize",
      "fontSizeAdjust",
      "fontFamily",
      "fontFeatureSettings",
      "fontLanguageOverride",
      "fontKerning",
      "fontStretch",
      "fontSynthesis",
      "counterReset",
      "counterIncrement",
      "content",
      "breakAfter",
      "breakBefore",
      "breakInside",
      "orphans",
      "scrollBehavior",
      "widows"
    ]
  ]
}
```

The 1st option is `"custom"`, `"asc"` or `"desc"`.

- `"custom"` (default) - enforce properties to be in a custom order.
- `"asc"` - enforce properties to be in ascending order.
- `"desc"` - enforce properties to be in descending order.

The 2nd option is an array with the custom order when used with `"custom"`. If not provided, a default order that is
loosely based on Concentric CSS (https://github.com/brandon-rhodes/Concentric-CSS) is used.

## When Not To Use It

If you don't want to notify about CSS properties' order inside of `sx` attribute, then it's safe to disable this rule.
