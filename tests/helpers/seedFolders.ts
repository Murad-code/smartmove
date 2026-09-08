import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

/**
 * Removes folders left behind by the admin journeys. Folders are created
 * through the interface in the test, because that is the part worth covering;
 * only the tidying up goes through the local API.
 */
export async function cleanupFolders(names: string[]): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'folders',
    where: { name: { in: names } },
    overrideAccess: true,
  })
}
