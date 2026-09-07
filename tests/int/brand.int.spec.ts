import { describe, expect, it } from 'vitest'

import { brandInitial, letterMarkSvg } from '@/lib/brand'

describe('brandInitial', () => {
  it('uses the first letter of the company name', () => {
    expect(brandInitial('Smart Move')).toBe('S')
    expect(brandInitial('acme lettings')).toBe('A')
  })

  it('falls back when the name is blank', () => {
    expect(brandInitial('')).toBe('S')
    expect(brandInitial('   ')).toBe('S')
  })
})

describe('letterMarkSvg', () => {
  it('escapes characters that would break the SVG', () => {
    expect(letterMarkSvg('<')).toContain('>&lt;</text>')
    expect(letterMarkSvg('<')).not.toContain('><')
  })
})
