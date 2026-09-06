'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

import { Icon } from '@/components/ui/Icon'
import { PROPERTY_TYPE_LABELS } from '@/lib/properties/labels'

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]
const RENT_OPTIONS = [400, 500, 600, 700, 850, 1000, 1500]

const SELECT_CLASS =
  'w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink-900 hover:border-ink-400 focus:border-navy-500'

/**
 * Property filters.
 *
 * Every change is written to the URL and the server re-renders the results, so
 * there is no client-side result state to keep in sync, filtered views are
 * shareable, and the page still works with JavaScript disabled thanks to the
 * plain `Apply` submit button.
 */
export function PropertyFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const current = useMemo(
    () => ({
      bedrooms: searchParams.get('bedrooms') ?? '',
      maxRent: searchParams.get('maxRent') ?? '',
      type: searchParams.get('type') ?? '',
      sort: searchParams.get('sort') ?? 'newest',
    }),
    [searchParams],
  )

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      // Any filter change invalidates the current page number.
      next.delete('page')
      const query = next.toString()
      router.push(query ? `/properties?${query}` : '/properties', { scroll: false })
    },
    [router, searchParams],
  )

  const hasFilters = Boolean(current.bedrooms || current.maxRent || current.type)

  return (
    <form
      method="get"
      action="/properties"
      className="rounded-card border border-ink-200 bg-white p-4 shadow-card sm:p-5"
      onSubmit={(event) => {
        // Progressive enhancement: without JS this posts as a normal GET.
        event.preventDefault()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="filter-bedrooms"
            className="mb-1.5 block text-sm font-medium text-ink-800"
          >
            Bedrooms
          </label>
          <select
            id="filter-bedrooms"
            name="bedrooms"
            className={SELECT_CLASS}
            value={current.bedrooms}
            onChange={(event) => update('bedrooms', event.target.value)}
          >
            <option value="">Any</option>
            {BEDROOM_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}+ bedrooms
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-rent" className="mb-1.5 block text-sm font-medium text-ink-800">
            Maximum rent
          </label>
          <select
            id="filter-rent"
            name="maxRent"
            className={SELECT_CLASS}
            value={current.maxRent}
            onChange={(event) => update('maxRent', event.target.value)}
          >
            <option value="">No maximum</option>
            {RENT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                Up to £{value.toLocaleString('en-GB')} pcm
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-type" className="mb-1.5 block text-sm font-medium text-ink-800">
            Property type
          </label>
          <select
            id="filter-type"
            name="type"
            className={SELECT_CLASS}
            value={current.type}
            onChange={(event) => update('type', event.target.value)}
          >
            <option value="">Any type</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="mb-1.5 block text-sm font-medium text-ink-800">
            Sort by
          </label>
          <select
            id="filter-sort"
            name="sort"
            className={SELECT_CLASS}
            value={current.sort}
            onChange={(event) => update('sort', event.target.value)}
          >
            <option value="newest">Most recent</option>
            <option value="rent-asc">Rent: lowest first</option>
            <option value="rent-desc">Rent: highest first</option>
            <option value="bedrooms-desc">Most bedrooms</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <p aria-live="polite" className="text-sm text-ink-600">
          {resultCount === 1 ? '1 property' : `${resultCount} properties`} found
        </p>

        <div className="flex items-center gap-3">
          {hasFilters ? (
            <button
              type="button"
              onClick={() => router.push('/properties', { scroll: false })}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
            >
              <Icon name="close" className="size-4" />
              Clear filters
            </button>
          ) : null}
          {/* Only reachable without JavaScript, where the selects fall back to
              a plain form submission. */}
          <noscript>
            <button
              type="submit"
              className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Apply filters
            </button>
          </noscript>
        </div>
      </div>
    </form>
  )
}
