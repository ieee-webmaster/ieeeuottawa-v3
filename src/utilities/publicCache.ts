export const PUBLIC_CACHE_VERSION = 'public-cms-v3'

export const EVENTS_REVALIDATE_SECONDS = 60 * 60
export const STATIC_CONTENT_REVALIDATE_SECONDS = 24 * 60 * 60
export const POSTS_PER_PAGE = 12

type PublicCacheTagName = 'all' | 'committee' | 'docs' | 'events' | 'media' | 'pages' | 'posts'

export const PUBLIC_CACHE_TAGS: { [Tag in PublicCacheTagName]: string } = {
  all: 'public-content',
  committee: 'public-committee',
  docs: 'public-docs',
  events: 'public-events',
  media: 'public-media',
  pages: 'public-pages',
  posts: 'public-posts',
}

export const publicCacheTags = (...tags: string[]): string[] => {
  return Array.from(new Set([PUBLIC_CACHE_TAGS.all, ...tags]))
}
