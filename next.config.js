import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

import redirects from './redirects.js'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const isStaticExport = process.env.STATIC_EXPORT === '1'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000')

const devImageOrigins =
  process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000']

/** @type {NonNullable<import('next').NextConfig['images']>['remotePatterns']} */
const remotePatterns = [
  NEXT_PUBLIC_SERVER_URL,
  process.env.STORAGE_VERCEL_BLOB_BASE_URL,
  ...devImageOrigins,
].flatMap((item) => {
  if (!item) return []
  const url = new URL(item)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Image origins must use HTTP or HTTPS')
  }

  return [
    {
      hostname: url.hostname,
      port: url.port,
      protocol: url.protocol === 'https:' ? 'https' : 'http',
      pathname: '/**',
    },
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: isStaticExport,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns,
  },
  output: isStaticExport ? 'export' : undefined,
  reactStrictMode: true,
  redirects: isStaticExport ? undefined : redirects,
  trailingSlash: isStaticExport,
}

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
