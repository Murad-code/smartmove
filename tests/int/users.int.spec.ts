import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { isRootAdminEmail } from '@/lib/root-user'

const rootEmail = 'owner-root@smartmove.test'
const otherAdminEmail = 'other-admin@smartmove.test'

let payload: Payload
let previousRootEmail: string | undefined

beforeAll(async () => {
  previousRootEmail = process.env.SEED_ADMIN_EMAIL
  payload = await getPayload({ config: await config })

  delete process.env.SEED_ADMIN_EMAIL
  for (const email of [rootEmail, otherAdminEmail]) {
    await payload.delete({
      collection: 'users',
      where: { email: { equals: email } },
      overrideAccess: true,
    })
  }

  process.env.SEED_ADMIN_EMAIL = rootEmail

  await payload.create({
    collection: 'users',
    data: {
      email: rootEmail,
      password: 'RootPassword123!',
      name: 'Owner',
      role: 'admin',
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: otherAdminEmail,
      password: 'OtherPassword123!',
      name: 'Other admin',
      role: 'admin',
    },
    overrideAccess: true,
  })
})

afterAll(async () => {
  delete process.env.SEED_ADMIN_EMAIL
  await payload.delete({
    collection: 'users',
    where: { email: { in: [rootEmail, otherAdminEmail] } },
    overrideAccess: true,
  })
  if (previousRootEmail === undefined) delete process.env.SEED_ADMIN_EMAIL
  else process.env.SEED_ADMIN_EMAIL = previousRootEmail
})

describe('root owner account', () => {
  it('recognises the SEED_ADMIN_EMAIL address without regard to case', () => {
    expect(isRootAdminEmail('Owner-Root@smartmove.test')).toBe(true)
    expect(isRootAdminEmail(otherAdminEmail)).toBe(false)
  })

  it('refuses to delete the owner account even with access overridden', async () => {
    const root = await payload.find({
      collection: 'users',
      where: { email: { equals: rootEmail } },
      limit: 1,
      overrideAccess: true,
    })
    const id = root.docs[0]?.id
    expect(id).toBeDefined()

    await expect(
      payload.delete({ collection: 'users', id: id!, overrideAccess: true }),
    ).rejects.toThrow(/cannot be deleted/i)
  })

  it('lets an admin delete a non-owner admin', async () => {
    const other = await payload.find({
      collection: 'users',
      where: { email: { equals: otherAdminEmail } },
      limit: 1,
      overrideAccess: true,
    })
    const actor = await payload.find({
      collection: 'users',
      where: { email: { equals: rootEmail } },
      limit: 1,
      overrideAccess: true,
    })

    const deleted = await payload.delete({
      collection: 'users',
      id: other.docs[0]!.id,
      user: actor.docs[0],
      overrideAccess: false,
    })

    expect(deleted.id).toBe(other.docs[0]!.id)
  })
})
