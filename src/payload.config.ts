import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  BoldFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { isStaff } from './access'
import { Enquiries } from './collections/Enquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Properties } from './collections/Properties'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { seedDemoEndpoint } from './endpoints/seed-demo'
import { payloadEmailAdapter } from './lib/email/payload-adapter'
import { env } from './lib/env'
import { previewUrl } from './lib/preview'
import { migrations } from './migrations'
import { BusinessDetails } from './globals/BusinessDetails'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: env.siteUrl,

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    // The admin panel is presented as Smart Move's own software, not as a
    // third-party CMS. This replaces every piece of Payload branding a member
    // of staff would otherwise see: the logo on the sign-in screen, the mark
    // in the navigation, the browser tab icon and the page metadata. The
    // compact mark and tab icon both resolve through /brand-icon.
    components: {
      graphics: {
        Logo: '@/components/admin/BrandLogo#BrandLogo',
        Icon: '@/components/admin/BrandIcon#BrandIcon',
      },
      beforeNavLinks: ['@/components/admin/DashboardNavLink#DashboardNavLink'],
      beforeDashboard: ['@/components/admin/DashboardTools#DashboardTools'],
      actions: ['@/components/admin/HeaderLogout#HeaderLogout'],
      providers: ['@/components/admin/ListRowClick#ListRowClick'],
    },
    meta: {
      titleSuffix: ' — Smart Move',
      description: 'Manage the Smart Move website',
      icons: [{ rel: 'icon', url: '/brand-icon' }],
      openGraph: {
        title: 'Smart Move',
        description: 'Manage the Smart Move website',
        siteName: 'Smart Move',
        images: [],
      },
    },
    // Everything the owner needs is in the sidebar; the stock dashboard cards
    // and the API URL row only add noise.
    theme: 'light',
    // Live preview: the page appears next to the editing form and refreshes
    // as the document is saved. Enabled here rather than on each collection so
    // the breakpoints and the URL rule are written once. Everything listed
    // must have a page on the website that mounts `LivePreview`.
    livePreview: {
      collections: ['pages', 'services', 'properties'],
      globals: ['home-page'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
      url: ({ data, collectionConfig, globalConfig }) => {
        const slug = typeof data?.slug === 'string' ? data.slug : ''

        if (globalConfig?.slug === 'home-page') return previewUrl('/')
        if (collectionConfig?.slug === 'properties') return previewUrl(`/properties/${slug}`)
        if (collectionConfig?.slug === 'services') return previewUrl(`/services/${slug}`)
        return previewUrl(`/${slug}`)
      },
    },
  },

  // The only place the CMS vendor's name appears in the interface copy.
  i18n: {
    translations: {
      en: {
        general: { payloadSettings: 'Your preferences' },
      },
    },
  },

  collections: [Properties, Pages, Services, Enquiries, Media, Users],
  globals: [HomePage, BusinessDetails, SiteSettings],
  endpoints: [seedDemoEndpoint],

  // Folders for the collections that opt in with `folders: true`, which is
  // Media alone. Payload generates a hidden collection to hold them; these
  // options are the difference between that and something the owner can use.
  folders: {
    // The generated collection's slug shows up in the URL of the folder view.
    // The default names the CMS vendor, which nothing in this panel does.
    slug: 'folders',
    // A top-level "browse by folder" screen would be a second route to the
    // only folder tree there is. The owner reaches folders from Media.
    browseByFolder: false,
    // Restricting a folder to one collection is only meaningful with more
    // than one folder-enabled collection. Off, so creating a folder asks for
    // a name and nothing else.
    collectionSpecific: false,
    collectionOverrides: [
      ({ collection }) => ({
        ...collection,
        // Payload defaults this collection to "any signed-in user". Filing
        // media is staff work, stated with the same helper as Media itself.
        access: {
          read: isStaff,
          create: isStaff,
          update: isStaff,
          delete: isStaff,
        },
      }),
    ],
  },

  // A restricted toolbar. The owner writes property descriptions, not
  // documents, so anything that could break the page design is left out.
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature({ enabledCollections: ['pages', 'properties', 'services'] }),
    ],
  }),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Production schema changes go through committed migrations only.
    push: process.env.NODE_ENV !== 'production',
    // Bundling the migrations into the build lets the container migrate itself
    // on first connect, so a production host needs no source checkout and no
    // separate migration step. Only used when NODE_ENV=production.
    prodMigrations: migrations,
  }),

  plugins: [
    seoPlugin({
      collections: ['properties', 'pages', 'services'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => (doc?.title as string) || '',
      generateDescription: ({ doc }) =>
        (doc?.shortDescription as string) || (doc?.summary as string) || '',
      generateURL: ({ doc, collectionSlug }) => {
        const origin = env.siteUrl
        const slug = (doc?.slug as string) || ''
        if (collectionSlug === 'properties') return `${origin}/properties/${slug}`
        if (collectionSlug === 'services') return `${origin}/services/${slug}`
        return `${origin}/${slug}`
      },
    }),
  ],

  upload: {
    limits: { fileSize: 15_000_000 },
  },

  // Password resets and admin invitations. Without this Payload writes them
  // to the console and a locked-out member of staff has no way back in.
  email: payloadEmailAdapter,

  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
  graphQL: {
    // Nothing consumes GraphQL; the extra public surface is not worth keeping.
    disable: true,
  },
})
