import type { Field } from 'payload'

/** Turns a title into a URL-safe slug. Shared by the field hook and the seed. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Auto-filled URL field.
 *
 * The owner should never have to think about slugs, so it fills itself from
 * the title and stays editable for anyone who needs to fix a URL. It sits in
 * the sidebar rather than the main form to keep the primary tab short.
 */
export function slugField(sourceField = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'The web address for this page. Filled in automatically.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          if (typeof value === 'string' && value.length > 0) return slugify(value)

          const source = (data?.[sourceField] ?? originalDoc?.[sourceField]) as
            | string
            | undefined
          return source ? slugify(source) : value
        },
      ],
    },
  }
}
