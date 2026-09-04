import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Config } from '@/payload-types'
import {
  EVENTS_REVALIDATE_SECONDS,
  POSTS_PER_PAGE,
  PUBLIC_CACHE_TAGS,
  PUBLIC_CACHE_VERSION,
  publicCacheTags,
  STATIC_CONTENT_REVALIDATE_SECONDS,
} from '@/utilities/publicCache'

type Locale = Config['locale']
type DocID = Config['db']['defaultIDType']

const localeKey = (locale?: Locale) => locale ?? 'default'

const idKey = (id: DocID | string) => String(id)

const categoryKey = (categoryIDs: Array<DocID | string>) => {
  return categoryIDs.map(String).sort().join(',')
}

const getPayloadClient = () => getPayload({ config: configPromise })

const findPublishedPageSlugs = async () => {
  const payload = await getPayloadClient()
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return pages.docs.filter(({ slug }) => slug !== 'home').map(({ slug }) => ({ slug }))
}

export const getPublishedPageSlugs = unstable_cache(
  findPublishedPageSlugs,
  [PUBLIC_CACHE_VERSION, 'page-slugs'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.pages),
  },
)

export const getPageBySlug = async <TDraft extends boolean = false>({
  draft,
  locale,
  slug,
}: {
  draft?: TDraft
  locale: Locale
  slug: string
}) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 1,
    locale,
    overrideAccess: draft ?? false,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
}

export const getCachedPageBySlug = (slug: string, locale: Locale) =>
  unstable_cache(
    async () => getPageBySlug({ draft: false, locale, slug }),
    [PUBLIC_CACHE_VERSION, 'page', localeKey(locale), slug],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(
        PUBLIC_CACHE_TAGS.pages,
        PUBLIC_CACHE_TAGS.posts,
        PUBLIC_CACHE_TAGS.events,
        PUBLIC_CACHE_TAGS.media,
      ),
    },
  )()

const findPublishedPostSlugs = async () => {
  const payload = await getPayloadClient()
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

export const getPublishedPostSlugs = unstable_cache(
  findPublishedPostSlugs,
  [PUBLIC_CACHE_VERSION, 'post-slugs'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.posts),
  },
)

const findPostList = async (locale: Locale, page = 1) => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit: POSTS_PER_PAGE,
    locale,
    overrideAccess: false,
    page,
    select: {
      categories: true,
      meta: {
        description: true,
        image: true,
      },
      slug: true,
      title: true,
    },
  })
}

export type PostCardData = Awaited<ReturnType<typeof findPostList>>['docs'][number]

export const getCachedPostList = (locale: Locale, page = 1) =>
  unstable_cache(
    async () => findPostList(locale, page),
    [PUBLIC_CACHE_VERSION, 'post-list', localeKey(locale), String(page)],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.posts, PUBLIC_CACHE_TAGS.media),
    },
  )()

export const getCachedPostTotalPages = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const { totalDocs } = await payload.count({
      collection: 'posts',
      overrideAccess: false,
    })

    return Math.ceil(totalDocs / POSTS_PER_PAGE)
  },
  [PUBLIC_CACHE_VERSION, 'post-total-pages'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.posts),
  },
)

export const getPostBySlug = async <TDraft extends boolean = false>({
  draft,
  locale,
  slug,
}: {
  draft?: TDraft
  locale: Locale
  slug: string
}) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    locale,
    overrideAccess: draft ?? false,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
}

export const getCachedPostBySlug = (slug: string, locale: Locale) =>
  unstable_cache(
    async () => getPostBySlug({ draft: false, locale, slug }),
    [PUBLIC_CACHE_VERSION, 'post', localeKey(locale), slug],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.posts, PUBLIC_CACHE_TAGS.media),
    },
  )()

type ArchivePostsArgs = {
  categoryIDs: Array<DocID | string>
  limit: number
  locale: Locale
}

const findArchivePosts = async ({ categoryIDs, limit, locale }: ArchivePostsArgs) => {
  const payload = await getPayloadClient()
  const fetchedPosts = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit,
    locale,
    overrideAccess: false,
    select: {
      categories: true,
      meta: {
        description: true,
        image: true,
      },
      slug: true,
      title: true,
    },
    ...(categoryIDs.length > 0
      ? {
          where: {
            categories: {
              in: categoryIDs,
            },
          },
        }
      : {}),
  })

  return fetchedPosts.docs
}

export const getCachedArchivePosts = ({ categoryIDs, limit, locale }: ArchivePostsArgs) =>
  unstable_cache(
    async () => findArchivePosts({ categoryIDs, limit, locale }),
    [
      PUBLIC_CACHE_VERSION,
      'archive-posts',
      localeKey(locale),
      String(limit),
      categoryKey(categoryIDs),
    ],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.posts, PUBLIC_CACHE_TAGS.media),
    },
  )()

const findPublishedEventSlugs = async () => {
  const payload = await getPayloadClient()
  const events = await payload.find({
    collection: 'events',
    depth: 0,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return events.docs.map(({ slug }) => ({ slug }))
}

export const getPublishedEventSlugs = unstable_cache(
  findPublishedEventSlugs,
  [PUBLIC_CACHE_VERSION, 'event-slugs'],
  {
    revalidate: EVENTS_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.events),
  },
)

const findEventList = async (locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'events',
    depth: 1,
    draft: false,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    select: {
      date: true,
      heroImage: true,
      location: true,
      slug: true,
      title: true,
    },
    sort: 'date',
  })

  return docs
}

export type EventListItem = Awaited<ReturnType<typeof findEventList>>[number]

export const getCachedEventList = (locale: Locale) =>
  unstable_cache(
    async () => findEventList(locale),
    [PUBLIC_CACHE_VERSION, 'event-list', localeKey(locale)],
    {
      revalidate: EVENTS_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.events, PUBLIC_CACHE_TAGS.media),
    },
  )()

export const getEventBySlug = async <TDraft extends boolean = false>({
  draft,
  locale,
  slug,
}: {
  draft?: TDraft
  locale: Locale
  slug: string
}) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    depth: 2,
    draft,
    limit: 1,
    locale,
    overrideAccess: draft ?? false,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
}

export const getCachedEventBySlug = (slug: string, locale: Locale) =>
  unstable_cache(
    async () => getEventBySlug({ draft: false, locale, slug }),
    [PUBLIC_CACHE_VERSION, 'event', localeKey(locale), slug],
    {
      revalidate: EVENTS_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.events, PUBLIC_CACHE_TAGS.media),
    },
  )()

const findCommitteeList = async (locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'committee',
    depth: 0,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    select: {
      teams: {
        id: true,
      },
      Year: true,
    },
    sort: '-Year',
  })

  return docs
}

export type CommitteeListItem = Awaited<ReturnType<typeof findCommitteeList>>[number]

export const getCachedCommitteeList = (locale: Locale) =>
  unstable_cache(
    async () => findCommitteeList(locale),
    [PUBLIC_CACHE_VERSION, 'committee-list', localeKey(locale)],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.committee),
    },
  )()

export const getCommitteeYears = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const committees = await payload.find({
      collection: 'committee',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        Year: true,
      },
    })

    return committees.docs.filter((committee) => committee.Year).map(({ Year }) => ({ year: Year }))
  },
  [PUBLIC_CACHE_VERSION, 'committee-years'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.committee),
  },
)

export const getCachedCommitteeByYear = (year: string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'committee',
        depth: 2,
        limit: 1,
        locale,
        overrideAccess: false,
        pagination: false,
        where: {
          Year: {
            equals: year,
          },
        },
      })

      return result.docs?.[0] || null
    },
    [PUBLIC_CACHE_VERSION, 'committee', localeKey(locale), year],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.committee, PUBLIC_CACHE_TAGS.media),
    },
  )()

export const getCachedCommitteeByID = (id: DocID | string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findByID({
        collection: 'committee',
        depth: 2,
        id,
        locale,
        overrideAccess: false,
      })
    },
    [PUBLIC_CACHE_VERSION, 'committee-by-id', localeKey(locale), idKey(id)],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.committee, PUBLIC_CACHE_TAGS.media),
    },
  )()

export const getCachedTeamByID = (id: DocID | string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findByID({
        collection: 'teams',
        depth: 1,
        id,
        locale,
        overrideAccess: false,
      })
    },
    [PUBLIC_CACHE_VERSION, 'team-by-id', localeKey(locale), idKey(id)],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.committee, PUBLIC_CACHE_TAGS.media),
    },
  )()

const findDocsList = async (locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'docs',
    depth: 0,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    select: {
      year: true,
    },
    sort: '-year',
  })

  return docs
}

export const getCachedDocsList = (locale: Locale) =>
  unstable_cache(
    async () => findDocsList(locale),
    [PUBLIC_CACHE_VERSION, 'docs-list', localeKey(locale)],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.docs),
    },
  )()

export const getDocYears = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const docs = await payload.find({
      collection: 'docs',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        year: true,
      },
    })

    return docs.docs.filter((doc) => doc.year).map(({ year }) => ({ year }))
  },
  [PUBLIC_CACHE_VERSION, 'doc-years'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.docs),
  },
)

export const getCachedDocByYear = (year: string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'docs',
        depth: 0,
        limit: 1,
        locale,
        overrideAccess: false,
        pagination: false,
        where: {
          year: {
            equals: year,
          },
        },
      })

      return result.docs?.[0] || null
    },
    [PUBLIC_CACHE_VERSION, 'doc', localeKey(locale), year],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(PUBLIC_CACHE_TAGS.docs),
    },
  )()
