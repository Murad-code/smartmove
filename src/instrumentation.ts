/**
 * Server start-up hook.
 *
 * Next.js calls `register` once per server process, before it handles any
 * request. This is where production seeding happens: the standalone build
 * inlines the Payload config into its own server chunks, so a separate script
 * cannot resolve `payload` at runtime, but code reached from here is part of
 * the build and every import resolves normally.
 *
 * Migrations are not run here. `prodMigrations` in the Payload config applies
 * them on the first database connection.
 */

export async function register() {
  // Also invoked for the edge runtime, which has no database access.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const mode = process.env.RUN_SEED_ON_BOOT
  if (mode !== 'true' && mode !== 'force') return

  const { getPayloadClient } = await import('@/lib/payload')
  const payload = await getPayloadClient()

  try {
    // `true` means "initialise an empty site", so an existing site is left
    // alone and the flag is safe to leave set. `force` re-asserts the seed
    // content on every boot, which is useful while a demo is being iterated
    // on but would overwrite the client's own edits.
    if (mode === 'true') {
      const { totalDocs } = await payload.count({ collection: 'users' })
      if (totalDocs > 0) {
        payload.logger.info('Seed skipped: this site is already set up.')
        return
      }
    }

    const { runSeed } = await import('@/scripts/seed-run')
    await runSeed(payload)
  } catch (error) {
    // A failed seed must not stop the site from serving. The database is
    // already migrated at this point, so the admin panel still works and the
    // owner can be walked through setup by hand.
    payload.logger.error({ err: error }, 'Seed on boot failed')
  }
}
