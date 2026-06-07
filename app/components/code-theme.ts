import type { ThemeRegistrationRaw } from 'shiki'

/**
 * Warm editorial Shiki theme for fenced code blocks.
 *
 * Foreground colors mirror the old sugar-high `--sh-*` tokens, which were tuned
 * to clear WCAG 1.4.3 (4.5:1) on the `--color-code-bg` background. The
 * background here MUST stay in sync with `--color-code-bg` in app/global.css
 * (Shiki emits it as an inline style and can't read CSS variables at build).
 *
 *   ink     #181713  plain text / variables
 *   rust    #7c4a32  functions, types, classes, properties, attributes
 *   stone   #6b6353  comments, punctuation, operators (4.84:1 on the code bg)
 *   olive   #5b6b3a  strings
 *   brick   #9e3b2f  keywords, tags, numbers, language constants
 *   clay    #5a5340  jsx text literals
 */
export const codeTheme: ThemeRegistrationRaw = {
  name: 'warm-light',
  type: 'light',
  colors: {
    'editor.background': '#efe7da',
    'editor.foreground': '#181713',
  },
  settings: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6b6353' },
    },
    {
      scope: [
        'keyword',
        'keyword.control',
        'storage.type',
        'storage.modifier',
        'keyword.operator.new',
        'keyword.operator.expression',
        'variable.language',
      ],
      settings: { foreground: '#9e3b2f' },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'constant.other.symbol',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#5b6b3a' },
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.language.boolean',
        'support.constant',
      ],
      settings: { foreground: '#9e3b2f' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call.generic',
        'entity.name.class',
        'entity.name.type',
        'support.class',
        'support.type',
        'entity.other.inherited-class',
      ],
      settings: { foreground: '#7c4a32' },
    },
    {
      scope: [
        'variable.other.constant',
        'variable.other.property',
        'support.variable.property',
        'meta.object-literal.key',
        'support.type.property-name',
        'entity.other.attribute-name',
      ],
      settings: { foreground: '#7c4a32' },
    },
    {
      scope: [
        'punctuation',
        'meta.brace',
        'keyword.operator',
        'punctuation.separator',
        'punctuation.terminator',
      ],
      settings: { foreground: '#6b6353' },
    },
    {
      scope: ['entity.name.tag', 'punctuation.definition.tag'],
      settings: { foreground: '#9e3b2f' },
    },
    {
      scope: ['variable', 'variable.other', 'variable.parameter'],
      settings: { foreground: '#181713' },
    },
    {
      scope: ['meta.jsx.children', 'meta.embedded'],
      settings: { foreground: '#5a5340' },
    },
  ],
}
