import canUseDOM from './canUseDOM'

const withoutTrailingSlash = (url: string) => url.replace(/\/+$/, '')

export const getServerSideURL = () => {
  return withoutTrailingSlash(
    process.env.NEXT_PUBLIC_SERVER_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3000'),
  )
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return withoutTrailingSlash(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }

  return process.env.NEXT_PUBLIC_SERVER_URL
    ? withoutTrailingSlash(process.env.NEXT_PUBLIC_SERVER_URL)
    : ''
}
