import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { isRootAdminEmail } from '@/lib/root-user'

const rootEmail = 'owner-root@smartmove.test'
const otherAdminEmail = 'other-admin@smartmove.test'
const staffAdminEmail = 'staff-admin@smartmove.test'
const editorEmail = 'editor-staff@smartmove.test'

let payload: Payload
let previousRootEmail: string | undefined
let previousLegacyRootEmail: string | undefined

beforeAll(async () => {
  previousRootEmail = process.env.ROOT_ADMIN_EMAIL
  previousLegacyRootEmail = process.env.SEED_ADMIN_EMAIL
  payload = await getPayload({ config: await config })

  delete process.env.SEED_ADMIN_EMAIL
  delete process.env.ROOT_ADMIN_EMAIL
  for (const email of [rootEmail, otherAdminEmail, staffAdminEmail, editorEmail]) {
    await payload.delete({
      collection: 'users',
      where: { email: { equals: email } },
      overrideAccess: true,
    })
  }

  process.env.ROOT_ADMIN_EMAIL = rootEmail

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

  await payload.create({
    collection: 'users',
    data: {
      email: staffAdminEmail,
      password: 'StaffPassword123!',
      name: 'Staff admin',
      role: 'admin',
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: editorEmail,
      password: 'EditorPassword123!',
      name: 'Editor',
      role: 'editor',
    },
    overrideAccess: true,
  })
})

afterAll(async () => {
  delete process.env.ROOT_ADMIN_EMAIL
  delete process.env.SEED_ADMIN_EMAIL
  await payload.delete({
    collection: 'users',
    where: { email: { in: [rootEmail, otherAdminEmail, staffAdminEmail, editorEmail] } },
    overrideAccess: true,
  })
  if (previousRootEmail === undefined) delete process.env.ROOT_ADMIN_EMAIL
  else process.env.ROOT_ADMIN_EMAIL = previousRootEmail
  if (previousLegacyRootEmail === undefined) delete process.env.SEED_ADMIN_EMAIL
  else process.env.SEED_ADMIN_EMAIL = previousLegacyRootEmail
})

describe('root owner account', () => {
  it('recognises the ROOT_ADMIN_EMAIL address without regard to case', () => {
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

  it('hides the owner account from other admins', async () => {
    const staff = await payload.find({
      collection: 'users',
      where: { email: { equals: staffAdminEmail } },
      limit: 1,
      overrideAccess: true,
    })

    const listed = await payload.find({
      collection: 'users',
      user: staff.docs[0],
      overrideAccess: false,
    })
    const emails = listed.docs.map((doc) => doc.email)

    expect(emails).not.toContain(rootEmail)
    expect(emails).toContain(staffAdminEmail)
    expect(emails).toContain(editorEmail)
  })

  it('lets the owner see every account, including their own', async () => {
    const root = await payload.find({
      collection: 'users',
      where: { email: { equals: rootEmail } },
      limit: 1,
      overrideAccess: true,
    })

    const listed = await payload.find({
      collection: 'users',
      user: root.docs[0],
      overrideAccess: false,
    })
    const emails = listed.docs.map((doc) => doc.email)

    expect(emails).toContain(rootEmail)
    expect(emails).toContain(staffAdminEmail)
  })

  it('refuses a regular admin reading or updating the owner account', async () => {
    const root = await payload.find({
      collection: 'users',
      where: { email: { equals: rootEmail } },
      limit: 1,
      overrideAccess: true,
    })
    const staff = await payload.find({
      collection: 'users',
      where: { email: { equals: staffAdminEmail } },
      limit: 1,
      overrideAccess: true,
    })
    const rootId = root.docs[0]!.id

    await expect(
      payload.findByID({
        collection: 'users',
        id: rootId,
        user: staff.docs[0],
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.update({
        collection: 'users',
        id: rootId,
        data: { name: 'Hijacked' },
        user: staff.docs[0],
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})

describe('editor accounts', () => {
  async function editorUser() {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: editorEmail } },
      limit: 1,
      overrideAccess: true,
    })
    return found.docs[0]!
  }

  it('is allowed into the admin panel', async () => {
    const users = payload.collections.users.config
    const allowed = await users.access.admin({ req: { user: await editorUser() } as never })
    expect(allowed).toBe(true)
  })

  it('can create a property', async () => {
    const created = await payload.create({
      collection: 'properties',
      data: {
        title: 'Editor Created Listing',
        status: 'draft',
        monthlyRent: 500,
        bedrooms: 2,
        propertyType: 'terraced',
        displayLocation: 'Test area',
        shortDescription: 'Created by an editor in the access tests.',
      },
      user: await editorUser(),
      overrideAccess: false,
    })

    expect(created.id).toBeDefined()
    await payload.delete({ collection: 'properties', id: created.id, overrideAccess: true })
  })

  it('cannot read other staff accounts', async () => {
    const listed = await payload.find({
      collection: 'users',
      user: await editorUser(),
      overrideAccess: false,
    })

    expect(listed.docs).toHaveLength(1)
    expect(listed.docs[0]?.email).toBe(editorEmail)
  })

  it('cannot create a staff account', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: 'should-not-exist@smartmove.test',
          password: 'NopePassword123!',
          name: 'Should not exist',
          role: 'editor',
        },
        user: await editorUser(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
