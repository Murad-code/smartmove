import type { SelectField } from 'payload'

/**
 * The icons an editor may pick.
 *
 * Deliberately a subset of `IconName`: the set here is the one that means
 * something to a letting agent, and every value must exist in
 * `src/components/ui/Icon.tsx` or the front end renders nothing. Kept in one
 * place so Services and the home page cannot drift apart.
 */
export const ICON_OPTIONS = [
  { label: 'Key', value: 'key' },
  { label: 'House', value: 'house' },
  { label: 'Shield', value: 'shield' },
  { label: 'Spanner', value: 'spanner' },
  { label: 'Chart', value: 'chart' },
  { label: 'Document', value: 'document' },
  { label: 'People', value: 'people' },
  { label: 'Pound sign', value: 'pound' },
] as const satisfies SelectField['options']

/**
 * Only the parts worth varying. Spreading a full `Partial<SelectField>` widens
 * `hasMany` to `boolean` and collapses the discriminated union, so the
 * overrides are listed rather than borrowed wholesale.
 */
type IconFieldOverrides = {
  name?: string
  label?: string
  defaultValue?: string
  required?: boolean
  admin?: SelectField['admin']
}

export function iconField(overrides: IconFieldOverrides = {}): SelectField {
  return {
    name: 'icon',
    type: 'select',
    label: 'Icon',
    defaultValue: 'key',
    options: [...ICON_OPTIONS],
    ...overrides,
  }
}
