/**
 * Server start-up hook.
 *
 * Next.js calls `register` once per server process, before it handles any
 * request. This is where production creates the root account and, on an
 * empty database, the starter pages. The standalone build inlines the
 * Payload config into its own server chunks, so a separate script cannot
 * resolve `payload` at runtime; code reached from here is part of the build.
 *
 * Migrations are not run here. `prodMigrations` in the Payload config applies
 * them on the first database connection.
 */

export async function register() {
  // Also invoked for the edge runtime, which has no database access.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // `next build` sets NODE_ENV=production but has no database.
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  if (!process.env.DATABASE_URL) return

  const { getPayloadClient } = await import('@/lib/payload')
  const payload = await getPayloadClient()

  try {
    const { totalDocs } = await payload.count({ collection: 'users' })
    const empty = totalDocs === 0

    const { ensureRootUser, runSeed } = await import('@/scripts/seed-run')

    if (empty) {
      // First boot: root account, starter pages, and demo listings if asked.
      await runSeed(payload)
      return
    }

    // Later boots: only make sure the configured root account exists.
    await ensureRootUser(payload)
  } catch (error) {
    payload.logger.error({ err: error }, 'Startup seed failed')
    if (process.env.NODE_ENV === 'production') throw error
  }
}
