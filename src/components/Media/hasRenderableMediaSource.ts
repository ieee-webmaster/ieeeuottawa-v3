import type { Media } from '@/payload-types'

type MediaSizeName = keyof NonNullable<Media['sizes']>

const renderableMediaSizeNames: MediaSizeName[] = [
  'thumbnail',
  'small',
  'medium',
  'large',
  'xlarge',
]

export const hasRenderableMediaSource = (media: Media): boolean => {
  if (media.url) {
    return true
  }

  return renderableMediaSizeNames.some((name) => {
    const size = media.sizes?.[name]
    return Boolean(size?.url)
  })
}
