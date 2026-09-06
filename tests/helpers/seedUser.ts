import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

export const testUser = {
  email: 'e2e@smartmove.test',
  password: 'TestPassword123!',
  name: 'End to end test',
  role: 'admin' as const,
}

/** Creates the admin account the end-to-end admin tests sign in with. */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: { email: { equals: testUser.email } },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'users',
    data: testUser,
    overrideAccess: true,
  })
}

export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: { email: { equals: testUser.email } },
    overrideAccess: true,
  })
}
