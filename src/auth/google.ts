import { randomBytes } from 'node:crypto'
import { APIError, parseCookies, type PayloadRequest, type Plugin } from 'payload'
import { OAuth2Plugin } from 'payload-oauth2'
import { z } from 'zod'

const domain = 'ieeeuottawa.ca'
const authorizePath = '/oauth/google'
const callbackPath = `${authorizePath}/callback`
const cookiePath = `/api/users${authorizePath}`
const stateCookie = 'google_oauth_state'
const failureRedirect = '/admin/login?googleError=1'

declare module 'payload' {
  interface RequestContext {
    googleOAuth?: boolean
  }
}

export const googleOAuthEnabled = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

const googleProfile = z.object({
  sub: z.string().min(1),
  email: z.email().transform((email) => email.toLowerCase()),
  email_verified: z.literal(true),
  hd: z.literal(domain),
  name: z.string().optional(),
})

export async function getGoogleUserInfo(accessToken: string, req: PayloadRequest) {
  // Fetch claims directly from Google over HTTPS using the server-exchanged access token.
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new APIError('Google sign-in failed.', 403)
  const profile = googleProfile.parse(await response.json())
  if (profile.email.split('@')[1] !== domain) {
    throw new APIError('Use your @ieeeuottawa.ca Google account.', 403)
  }
  req.context.googleOAuth = true

  // Link an existing account only after Google proves ownership of its Workspace email.
  // Subsequent logins use Google's immutable subject, not the email address.
  const { docs } = await req.payload.find({
    collection: 'users',
    where: { email: { equals: profile.email } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  })
  const existing = docs[0]
  if (existing?.googleId && existing.googleId !== profile.sub) {
    throw new APIError('This email is linked to a different Google account.', 403)
  }
  if (existing && !existing.googleId) {
    await req.payload.update({
      collection: 'users',
      id: existing.id,
      data: { googleId: profile.sub },
      overrideAccess: true,
      req,
    })
  }
  return {
    googleId: profile.sub,
    email: profile.email,
    ...(existing ? {} : { name: profile.name }),
  }
}

export function extractGoogleCode(req: PayloadRequest): Promise<string> {
  const cookies = parseCookies(req.headers)
  const state = req.searchParams.get('state')
  const code = req.searchParams.get('code')
  if (
    req.method !== 'GET' ||
    req.searchParams.has('error') ||
    !state ||
    !/^[a-f0-9]{64}$/.test(state) ||
    state !== cookies.get(stateCookie) ||
    !/^[A-Za-z0-9_-]{43}$/.test(cookies.get('pkce_verifier') ?? '') ||
    !code
  ) {
    throw new APIError('Google sign-in expired. Please try again.', 403)
  }
  return Promise.resolve(code)
}

export const googleOAuthPlugin =
  (serverURL: string): Plugin =>
  async (config) => {
    if (!googleOAuthEnabled()) return config
    const secureCookie = serverURL.startsWith('https:') ? '; Secure' : ''
    const cookieAttributes = `; Path=${cookiePath}; HttpOnly; SameSite=Lax${secureCookie}`
    const updated = await OAuth2Plugin({
      strategyName: 'google',
      authCollection: 'users',
      subFieldName: 'googleId',
      serverURL,
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorizePath,
      callbackPath,
      providerAuthorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?hd=${domain}`,
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scopes: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      pkceEnabled: true,
      onUserNotFoundBehavior: 'create',
      callbackExtractToken: extractGoogleCode,
      getUserInfo: getGoogleUserInfo,
      successRedirect: () => '/admin',
      failureRedirect: () => failureRedirect,
    })(config)

    const users = updated.collections?.find(({ slug }) => slug === 'users')
    // Upstream moves Users to the end; keep generated schemas stable with or without credentials.
    updated.collections = config.collections?.map((collection) =>
      collection.slug === 'users' && users ? users : collection,
    )
    if (users?.endpoints) {
      users.endpoints = users.endpoints.map((endpoint) => {
        if (endpoint.path !== authorizePath && endpoint.path !== callbackPath) return endpoint
        return {
          ...endpoint,
          handler: async (req) => {
            const result = await endpoint.handler(req)
            // Copy immutable redirect headers before adding our browser-bound state cookie.
            const response = new Response(result.body, result)
            response.headers.set('Cache-Control', 'no-store')
            if (endpoint.path === authorizePath && response.headers.has('Location')) {
              const location = new URL(response.headers.get('Location') ?? serverURL)
              const state = randomBytes(32).toString('hex')
              location.searchParams.set('state', state)
              location.searchParams.set('access_type', 'online')
              response.headers.set('Location', location.toString())
              // Upstream creates the verifier; make its cookie HttpOnly and scope it to this flow.
              const verifierCookie = response.headers.get('Set-Cookie')
              if (verifierCookie) {
                response.headers.set(
                  'Set-Cookie',
                  `${verifierCookie}; Path=${cookiePath}; HttpOnly${secureCookie}`,
                )
              }
              response.headers.append(
                'Set-Cookie',
                `${stateCookie}=${state}; Max-Age=600${cookieAttributes}`,
              )
            } else if (endpoint.path === callbackPath) {
              for (const name of [stateCookie, 'pkce_verifier']) {
                response.headers.append('Set-Cookie', `${name}=; Max-Age=0${cookieAttributes}`)
              }
            }
            return response
          },
        }
      })
    }
    return updated
  }
