import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'
import type { MediaSizesPreset } from './sizes'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager'
  priority?: boolean
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number | null // for Payload media
  sizes?: string
  sizesPreset?: MediaSizesPreset
  src?: StaticImageData // for static media
  videoClassName?: string
}
