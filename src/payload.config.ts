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
import { BusinessDetails } from './globals/BusinessDetails'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

export default buildConfig({
  serverURL: siteUrl,

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
        const slug = typeof data?.slug === 'string' ? data.slug : ''
        if (collectionConfig?.slug === 'properties') return `${siteUrl}/properties/${slug}`
        if (collectionConfig?.slug === 'services') return `${siteUrl}/services/${slug}`
        return `${siteUrl}/${slug}`
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
        const slug = (doc?.slug as string) || ''
        if (collectionSlug === 'properties') return `${siteUrl}/properties/${slug}`
        if (collectionSlug === 'services') return `${siteUrl}/services/${slug}`
        return `${siteUrl}/${slug}`
      },
    }),
  ],

  upload: {
    limits: { fileSize: 15_000_000 },
  },

  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
  graphQL: {
    // Nothing consumes GraphQL; the extra public surface is not worth keeping.
    disable: true,
  },
})
