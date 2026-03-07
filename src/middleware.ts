import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all frontend page routes. Exclude Payload admin, Payload API, Next.js
  // internals, the /next/* preview/seed handlers, sitemap XML files, and any
  // path that looks like a static asset (contains a file extension).
  matcher: ['/((?!api|admin|_next|next|[^/]+\\.[^/]+).*)'],
}
