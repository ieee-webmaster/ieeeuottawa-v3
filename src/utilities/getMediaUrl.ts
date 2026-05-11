import { getServerSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  const separator = url.includes('?') ? '&' : '?'

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return cacheTag ? `${url}${separator}${cacheTag}` : url
  }

  const baseUrl = getServerSideURL()
  const src = `${baseUrl}/${url.replace(/^\/+/, '')}`
  return cacheTag ? `${src}${separator}${cacheTag}` : src
}
