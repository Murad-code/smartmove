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

import { Enquiries } from './collections/Enquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Properties } from './collections/Properties'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { seedDemoEndpoint } from './endpoints/seed-demo'
import { payloadEmailAdapter } from './lib/email/payload-adapter'
import { env } from './lib/env'
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
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
      url: ({ data, collectionConfig }) => {
        const origin = env.siteUrl
        const slug = typeof data?.slug === 'string' ? data.slug : ''
        if (collectionConfig?.slug === 'properties') return `${origin}/properties/${slug}`
        if (collectionConfig?.slug === 'services') return `${origin}/services/${slug}`
        return `${origin}/${slug}`
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
