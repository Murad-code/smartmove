import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Cache invalidation.
 *
 * Property and page routes are prerendered, so without this an edit in the
 * admin panel would not appear on the website until the next deployment. Each
 * hook clears just the paths its document affects.
 *
 * `next/cache` is imported lazily because the Payload config is also loaded
 * outside Next by the seed and migration commands, where it does not exist.
 */
async function revalidate(paths: string[], layoutPaths: string[] = []) {
  try {
    const { revalidatePath } = await import('next/cache')
    for (const path of paths) revalidatePath(path)
    for (const path of layoutPaths) revalidatePath(path, 'layout')
  } catch {
    // Running outside a Next server (seed, migrations). Nothing to clear.
  }
}

function pathsForProperty(slug: unknown): string[] {
  const paths = ['/', '/properties', '/sitemap.xml']
  if (typeof slug === 'string' && slug) paths.push(`/properties/${slug}`)
  return paths
}

export const revalidateProperty: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  // A renamed property leaves its old URL behind, so clear that too.
  const slugs = new Set([doc?.slug, previousDoc?.slug])
  await revalidate([...new Set([...slugs].flatMap(pathsForProperty))])
  return doc
}

export const revalidatePropertyOnDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidate(pathsForProperty(doc?.slug))
  return doc
}

export const revalidatePage: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const slugs = [doc?.slug, previousDoc?.slug].filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0,
  )
  await revalidate(['/sitemap.xml', ...slugs.map((slug) => `/${slug}`)])
  return doc
}

export const revalidatePageOnDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const slug = doc?.slug
  await revalidate(['/sitemap.xml', ...(typeof slug === 'string' ? [`/${slug}`] : [])])
  return doc
}

export const revalidateService: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const slugs = [doc?.slug, previousDoc?.slug].filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0,
  )
  await revalidate(['/services', '/sitemap.xml', ...slugs.map((slug) => `/services/${slug}`)])
  return doc
}

export const revalidateServiceOnDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const slug = doc?.slug
  await revalidate([
    '/services',
    '/sitemap.xml',
    ...(typeof slug === 'string' ? [`/services/${slug}`] : []),
  ])
  return doc
}

/**
 * Globals feed the header and footer on every page, so a change to any of them
 * has to clear the whole tree.
 */
export const revalidateEverything: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidate(['/sitemap.xml'], ['/'])
  return doc
}
