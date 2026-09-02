import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import React from 'react'
import RichText from '@/components/RichText'
import { resolveLocale } from '@/i18n/routing'
import { getLocale } from 'next-intl/server'

import { CollectionArchive } from '@/components/CollectionArchive'
import { getCachedArchivePosts, type PostCardData } from '@/utilities/publicCms'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: PostCardData[] = []

  if (populateBy === 'collection') {
    const locale = resolveLocale(await getLocale())

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    }) ?? []

    posts = await getCachedArchivePosts({
      categoryIDs: flattenedCategories,
      limit,
      locale,
    })
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs
        .map((post) => post.value)
        .filter((value): value is Post => typeof value === 'object' && value !== null)

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
