import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { MediaSizesPreset } from '../sizes'

type ResponsiveSizeName = 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge'

const responsiveSizeNames: ResponsiveSizeName[] = [
  'thumbnail',
  'small',
  'medium',
  'large',
  'xlarge',
]

const responsiveSizeNamesByPreset: {
  [Preset in MediaSizesPreset]: ResponsiveSizeName[]
} = {
  affinity: ['medium', 'large'],
  avatar: ['thumbnail', 'small'],
  content: ['large', 'xlarge'],
  full: ['large', 'xlarge'],
  galleryHalf: ['medium', 'large'],
  galleryQuarter: ['small', 'medium'],
  galleryThird: ['small', 'medium'],
  half: ['medium', 'large'],
  icon: ['thumbnail'],
  portraitGrid: ['small', 'medium'],
  quarter: ['small', 'medium'],
  split: ['medium', 'large'],
  third: ['small', 'medium'],
}

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

export const getResponsiveImageData = (
  media: Media,
  sizesPreset: MediaSizesPreset = 'full',
): ResponsiveImageData | null => {
  const allCandidates = responsiveSizeNames
    .map((name) => media.sizes?.[name])
    .flatMap((size, index) => {
      if (!size?.url || !size.width || size.width <= 0) return []

      return [
        {
          height: inferHeight(media, size.width, size.height),
          name: responsiveSizeNames[index],
          src: getMediaUrl(size.url, media.updatedAt),
          width: size.width,
        },
      ]
    })
    .sort((a, b) => a.width - b.width)

  const allowedSizeNames = new Set(responsiveSizeNamesByPreset[sizesPreset])
  const preferredCandidates = allCandidates.filter((candidate) =>
    allowedSizeNames.has(candidate.name),
  )
  const candidates = preferredCandidates.length > 0 ? preferredCandidates : allCandidates.slice(-2)

  const largest = candidates.at(-1)
  if (largest) {
    return {
      height: largest.height,
      src: largest.src,
      srcSet:
        candidates.length > 1
          ? candidates.map(({ src, width }) => `${src} ${width}w`).join(', ')
          : undefined,
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
