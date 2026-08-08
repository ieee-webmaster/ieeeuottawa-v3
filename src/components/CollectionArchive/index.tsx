import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  bare?: boolean
  className?: string
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { bare = false, className, posts } = props

  return (
    <div className={cn(!bare && 'container', className)}>
      <div className="grid grid-cols-4 gap-x-4 gap-y-12 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16">
        {posts?.map((result, index) => {
          if (typeof result === 'object' && result !== null) {
            const href = `/posts/${encodeURIComponent(result.slug)}`

            return (
              <div className="col-span-4" key={result.slug || index}>
                <Card
                  className="h-full"
                  doc={result}
                  href={href}
                  index={index}
                  showCategories
                  total={posts.length}
                />
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
