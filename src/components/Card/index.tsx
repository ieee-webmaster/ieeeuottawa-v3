import { cn } from '@/utilities/ui'
import { Link } from '@/i18n/navigation'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  href: string
  index?: number
  showCategories?: boolean
  title?: string
  total?: number
}> = (props) => {
  const { className, doc, href, index, showCategories, title: titleFromProps, total } = props

  const { categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space

  return (
    <article className={cn('group flex h-full flex-col hover:cursor-pointer', className)}>
      <Link href={href} className="flex h-full flex-col gap-5">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/[0.04]">
          {metaImage && typeof metaImage !== 'number' ? (
            <Media
              fill
              imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              pictureClassName="absolute inset-0"
              resource={metaImage}
              sizesPreset="third"
            />
          ) : null}
          {typeof index === 'number' && typeof total === 'number' ? (
            <span className="absolute left-3 top-3 bg-black/55 px-2 py-1 font-mono text-[0.68rem] tracking-[0.18em] text-white backdrop-blur-sm">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {showCategories && hasCategories && (
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">
              {showCategories && hasCategories && (
                <div>
                  {categories?.map((category, index) => {
                    if (typeof category === 'number') {
                      return null
                    }

                    const categoryTitle = category.title || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  })}
                </div>
              )}
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
