import { NextRequest, NextResponse } from 'next/server'

import { defaultLocale, isLocale, localeCookieName } from '@/i18n/config'

const excludedPaths = [
  '/admin',
  '/api',
  '/_next',
  '/next',
  '/favicon.ico',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/pages-sitemap.xml',
  '/posts-sitemap.xml',
  '/media',
]

const isExcludedPath = (pathname: string) => {
  if (pathname.includes('.')) return true
  return excludedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (isExcludedPath(pathname)) {
    return NextResponse.next()
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  if (isLocale(firstSegment)) {
    const rewrittenPath = `/${pathSegments.slice(1).join('/')}` || '/'
    const rewriteURL = request.nextUrl.clone()
    rewriteURL.pathname = rewrittenPath === '//' ? '/' : rewrittenPath

    const response = NextResponse.rewrite(rewriteURL)
    response.cookies.set(localeCookieName, firstSegment, { path: '/' })

    return response
  }

  const redirectURL = request.nextUrl.clone()
  redirectURL.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  redirectURL.search = search

  const response = NextResponse.redirect(redirectURL, 308)
  response.cookies.set(localeCookieName, defaultLocale, { path: '/' })

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
