export type InferUrlsInput = {
  collection?: string | null
  base?: string | null
  specific?: string | null
}

export type InferUrlsResult = {
  baseUrl: string
  specificUrl: string
}

const VALUE_TOKEN = '[value]'

const trimOrEmpty = (value: string | null | undefined): string => value?.trim() ?? ''

const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`)

const stripValueToken = (specific: string): string => {
  if (!specific.endsWith(VALUE_TOKEN)) return specific
  const withoutToken = specific.slice(0, -VALUE_TOKEN.length)
  return withoutToken.endsWith('/') ? withoutToken : `${withoutToken}/`
}

const appendValueToken = (base: string): string =>
  base.endsWith('/') ? `${base}${VALUE_TOKEN}` : `${base}/${VALUE_TOKEN}`

export const inferUrls = ({ collection, base, specific }: InferUrlsInput): InferUrlsResult => {
  const cleanBase = trimOrEmpty(base)
  const cleanSpecific = trimOrEmpty(specific)

  if (cleanBase && cleanSpecific) {
    return {
      baseUrl: ensureLeadingSlash(cleanBase),
      specificUrl: ensureLeadingSlash(cleanSpecific),
    }
  }

  if (cleanSpecific) {
    return {
      baseUrl: ensureLeadingSlash(stripValueToken(cleanSpecific)),
      specificUrl: ensureLeadingSlash(cleanSpecific),
    }
  }

  if (cleanBase) {
    return {
      baseUrl: ensureLeadingSlash(cleanBase),
      specificUrl: ensureLeadingSlash(appendValueToken(cleanBase)),
    }
  }

  const slug = trimOrEmpty(collection)
  if (!slug) {
    return { baseUrl: '/', specificUrl: `/${VALUE_TOKEN}` }
  }

  return {
    baseUrl: `/${slug}/`,
    specificUrl: `/${slug}/${VALUE_TOKEN}`,
  }
}

export const fillSpecificUrl = (specificUrl: string, value: string): string =>
  specificUrl.replace(VALUE_TOKEN, encodeURIComponent(value))
