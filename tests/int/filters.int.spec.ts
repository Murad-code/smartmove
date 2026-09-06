import { describe, expect, it } from 'vitest'

import { buildQuery, hasActiveFilters, parseFilters, parsePage } from '@/lib/properties/filters'

describe('parsing property filters from the URL', () => {
  it('reads a full set of filters', () => {
    expect(
      parseFilters({ bedrooms: '3', maxRent: '800', type: 'terraced', sort: 'rent-asc' }),
    ).toEqual({
      minBedrooms: 3,
      maxRent: 800,
      propertyType: 'terraced',
      status: undefined,
      sort: 'rent-asc',
    })
  })

  it('drops values that are not real property types', () => {
    expect(parseFilters({ type: 'castle' }).propertyType).toBeUndefined()
  })

  it('drops non-numeric and negative numbers', () => {
    expect(parseFilters({ bedrooms: 'three' }).minBedrooms).toBeUndefined()
    expect(parseFilters({ maxRent: '-500' }).maxRent).toBeUndefined()
  })

  it('drops a sort order it does not recognise', () => {
    expect(parseFilters({ sort: 'drop table' }).sort).toBeUndefined()
  })

  it('never lets a visitor ask for hidden statuses', () => {
    expect(parseFilters({ status: 'draft' }).status).toBeUndefined()
    expect(parseFilters({ status: 'let' }).status).toBeUndefined()
    expect(parseFilters({ status: 'available' }).status).toBe('available')
  })

  it('takes the first value when a parameter is repeated', () => {
    expect(parseFilters({ bedrooms: ['2', '4'] }).minBedrooms).toBe(2)
  })
})

describe('page numbers', () => {
  it('defaults to page one', () => {
    expect(parsePage({})).toBe(1)
    expect(parsePage({ page: '0' })).toBe(1)
    expect(parsePage({ page: 'abc' })).toBe(1)
  })

  it('reads a valid page number', () => {
    expect(parsePage({ page: '4' })).toBe(4)
  })
})

describe('building the query string back', () => {
  it('produces an empty string for no filters', () => {
    expect(buildQuery({})).toBe('')
  })

  it('omits the default sort order and the first page', () => {
    expect(buildQuery({ sort: 'newest' }, 1)).toBe('')
  })

  it('round-trips through parsing unchanged', () => {
    const filters = { minBedrooms: 2, maxRent: 750, propertyType: 'flat' as const }
    const query = buildQuery(filters, 3)
    const params = Object.fromEntries(new URLSearchParams(query.slice(1)))

    expect(parseFilters(params)).toMatchObject(filters)
    expect(parsePage(params)).toBe(3)
  })
})

describe('detecting active filters', () => {
  it('ignores sort order, which is not a filter', () => {
    expect(hasActiveFilters({ sort: 'rent-desc' })).toBe(false)
  })

  it('spots a real filter', () => {
    expect(hasActiveFilters({ minBedrooms: 2 })).toBe(true)
  })
})
