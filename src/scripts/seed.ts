/**
 * Command-line entry point for the seed.
 *
 *   pnpm seed
 *
 * Used in development and by the test setup. Production creates the root
 * account (and seeds an empty database) on boot through
 * `src/instrumentation.ts`, because the standalone build cannot resolve
 * `payload` from a plain script. The work is the same either way: see
 * `seed-run.ts`.
 */

// Marks the file as a module so top-level await is allowed.
export {}

// The environment has to be in place before the Payload config module is
// evaluated, which is why the config is imported dynamically below.
await import('dotenv/config')

const { getPayload } = await import('payload')
const { default: config } = await import('@/payload.config')
const { runSeed } = await import('./seed-run')

try {
  const payload = await getPayload({ config })
  await runSeed(payload)
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
