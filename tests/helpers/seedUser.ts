import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

export interface TestUser {
  email: string
  password: string
  name: string
  role: 'admin'
}

export const testUser: TestUser = {
  email: 'e2e@smartmove.test',
  password: 'TestPassword123!',
  name: 'End to end test',
  role: 'admin',
}

/**
 * A separate account for a spec file that may run in a parallel worker.
 * Sharing one account means whichever file finishes first deletes it, and the
 * other fails at the sign-in screen.
 */
export function testUserFor(spec: string): TestUser {
  return {
    ...testUser,
    email: `e2e-${spec}@smartmove.test`,
    name: `End to end test (${spec})`,
  }
}

/** Creates the admin account an end-to-end spec signs in with. */
export async function seedTestUser(user: TestUser = testUser): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: { email: { equals: user.email } },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'users',
    data: user,
    overrideAccess: true,
  })
}

export async function cleanupTestUser(user: TestUser = testUser): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: { email: { equals: user.email } },
    overrideAccess: true,
  })
}
