/**
 * Builders for Lexical rich-text values.
 *
 * Payload stores rich text as a Lexical editor state. Hand-writing that JSON
 * in the seed would be unreadable, so these helpers produce it from plain
 * strings. Only the node types the editor is configured to allow are covered.
 */

interface TextNode {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: 'normal'
  style: string
  version: 1
}

function text(value: string, bold = false): TextNode {
  return {
    type: 'text',
    text: value,
    // Lexical's format is a bitmask; 1 is bold.
    format: bold ? 1 : 0,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

const BLOCK_DEFAULTS = {
  format: '' as const,
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
}

export function paragraph(value: string) {
  return {
    ...BLOCK_DEFAULTS,
    type: 'paragraph',
    textFormat: 0,
    textStyle: '',
    children: [text(value)],
  }
}

export function heading(value: string, tag: 'h2' | 'h3' | 'h4' = 'h2') {
  return {
    ...BLOCK_DEFAULTS,
    type: 'heading',
    tag,
    children: [text(value)],
  }
}

export function bulletList(items: string[]) {
  return {
    ...BLOCK_DEFAULTS,
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    children: items.map((item, index) => ({
      ...BLOCK_DEFAULTS,
      type: 'listitem',
      value: index + 1,
      checked: undefined,
      children: [text(item)],
    })),
  }
}

type Block = ReturnType<typeof paragraph | typeof heading | typeof bulletList>

/** Wraps blocks in the root node Payload expects. */
export function richText(...blocks: Block[]) {
  return {
    root: {
      ...BLOCK_DEFAULTS,
      type: 'root',
      children: blocks,
    },
  }
}

/** Shorthand for the common case of one or more plain paragraphs. */
export function paragraphs(...values: string[]) {
  return richText(...values.map(paragraph))
}
