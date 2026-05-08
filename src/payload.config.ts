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
import { navigationPlugin } from './plugins/payload-navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
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
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
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
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
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
      userCollectionSlug: Users.slug,
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
  ],
  globals: [Header, Footer],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
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
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
