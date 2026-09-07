import { cn } from '@/utilities/ui'
import { Link } from '@/i18n/navigation'
import React from 'react'

import type { Category, Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'meta' | 'title'> & {
  categories?: (number | Pick<Category, 'title'>)[] | null
}

export const Card: React.FC<{
  className?: string
  doc?: CardPostData
  href: string
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, href, showCategories, title: titleFromProps } = props

  const { categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const categoryTitles = categories?.flatMap((category) =>
    typeof category === 'number' ? [] : [category.title || 'Untitled category'],
  )
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space

  return (
    <article className={cn('group flex h-full flex-col hover:cursor-pointer', className)}>
      <Link href={href} className="flex h-full flex-col gap-5">
        {metaImage && typeof metaImage !== 'number' && (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Media
              fill
              imgClassName="object-cover"
              pictureClassName="absolute inset-0"
              resource={metaImage}
              sizesPreset="third"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3">
          {showCategories && !!categoryTitles?.length && (
            <div className="font-mono text-xs text-primary">
              <div>{categoryTitles.join(', \u00a0')}</div>
            </div>
          )}
          {titleToUse && (
            <h3 className="text-balance text-xl font-medium leading-tight tracking-tight transition-colors group-hover:text-primary md:text-2xl">
              {titleToUse}
            </h3>
          )}
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{sanitizedDescription}</p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
