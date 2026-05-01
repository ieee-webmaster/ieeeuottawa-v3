import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

import redirects from './redirects.js'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000')

const remotePatterns = [NEXT_PUBLIC_SERVER_URL, process.env.STORAGE_VERCEL_BLOB_BASE_URL]
  .filter(Boolean)
  .map((item) => {
    const url = new URL(item)

    return {
      hostname: url.hostname,
      port: url.port,
      protocol: url.protocol.replace(':', ''),
    }
  })

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
  reactStrictMode: true,
  redirects,
}

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
