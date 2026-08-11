import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const responsiveSizeNames = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

export type ResponsiveImageData = {
  height?: number
  src: string
  srcSet?: string
  width?: number
}

const inferHeight = (media: Media, width: number, height?: number | null) => {
  if (height && height > 0) return height
  if (!media.width || !media.height) return undefined
  return Math.round((width * media.height) / media.width)
}

export const getResponsiveImageData = (media: Media): ResponsiveImageData | null => {
  const candidates = responsiveSizeNames
    .map((name) => media.sizes?.[name])
    .flatMap((size) => {
      if (!size?.url || !size.width || size.width <= 0) return []

      return [
        {
          height: inferHeight(media, size.width, size.height),
          src: getMediaUrl(size.url, media.updatedAt),
          width: size.width,
        },
      ]
    })
    .sort((a, b) => a.width - b.width)

  const largest = candidates.at(-1)
  if (largest) {
    return {
      height: largest.height,
      src: largest.src,
      srcSet: candidates.map(({ src, width }) => `${src} ${width}w`).join(', '),
      width: largest.width,
    }
  }

  if (!media.url) return null

  return {
    height: media.height && media.height > 0 ? media.height : undefined,
    src: getMediaUrl(media.url, media.updatedAt),
    width: media.width && media.width > 0 ? media.width : undefined,
  }
}
