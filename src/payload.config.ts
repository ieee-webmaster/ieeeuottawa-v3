import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Events } from './collections/Events'
import { SocialLinks } from './collections/SocialLinks'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { People } from './collections/People'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Committees } from './collections/Committees'
import { Teams } from './collections/Teams'
import { Docs } from './collections/Docs'
import { rbacPlugin } from './plugins/payload-rbac'
import { autoArrayRowLabelsPlugin } from './plugins/payload-row-labels'
import { staticPublishingPlugin } from './plugins/staticPublishing'
import { navigationPlugin } from './plugins/payload-navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
if (process.env.PRODUCTION_EDITOR === '1' && process.env.PAYLOAD_DROP_DATABASE) {
  throw new Error('PAYLOAD_DROP_DATABASE is forbidden in the production editor')
}
const storagePlugins =
  process.env.STATIC_EXPORT === '1' || process.env.PRODUCTION_EDITOR === '1'
    ? []
    : [
        vercelBlobStorage({
          collections: {
            // Media is publicly readable, so serve files directly from Vercel Blob
            // instead of proxying every request through the Payload function.
            media: {
              disablePayloadAccessControl: true,
            },
          },
          token:
            process.env.BLOB_READ_WRITE_TOKEN ??
            (() => {
              throw new Error('Missing required env var: BLOB_READ_WRITE_TOKEN')
            })(),
        }),
      ]

export default buildConfig({
  admin: {
    components: {
      header: ['@/components/ProductionEditorNotice'],
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    push:
      process.env.PRODUCTION_EDITOR === '1' || process.env.STATIC_EXPORT === '1'
        ? false
        : undefined,
    disableCreateDatabase:
      process.env.PRODUCTION_EDITOR === '1' || process.env.STATIC_EXPORT === '1',
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  defaultDepth: 1,
  maxDepth: 2,
  graphQL: {
    disable: true,
  },
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Events,
    People,
    Teams,
    Committees,
    Docs,
    SocialLinks,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    ...plugins,
    ...storagePlugins,
    rbacPlugin({
      collections: [
        Pages.slug,
        Posts.slug,
        Media.slug,
        Categories.slug,
        Events.slug,
        People.slug,
        Teams.slug,
        Committees.slug,
        Docs.slug,
        SocialLinks.slug,
        'redirects',
        'forms',
        'form-submissions',
      ],
      tagAccessCollections: [
        Pages.slug,
        Posts.slug,
        Media.slug,
        Categories.slug,
        Events.slug,
        People.slug,
        Teams.slug,
        Committees.slug,
        Docs.slug,
        SocialLinks.slug,
      ],
      globals: [Header.slug, Footer.slug],
    }),
    navigationPlugin({
      collections: [
        Pages.slug,
        Posts.slug,
        Events.slug,
        People.slug,
        Teams.slug,
        Committees.slug,
        Docs.slug,
        Categories.slug,
      ],
      globals: [Header.slug, Footer.slug],
    }),
    autoArrayRowLabelsPlugin({
      excludePaths: ['header.navItems', 'footer.navItems'],
    }),
    staticPublishingPlugin,
  ],
  globals: [Header, Footer],
  secret: process.env.PAYLOAD_SECRET ?? '',
  sharp,
  typescript: {
    strictDraftTypes: true,
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET
        return Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`
      },
    },
    tasks: [],
  },
})
