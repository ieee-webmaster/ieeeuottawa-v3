import type { StaticImageData } from 'next/image'
import type { ElementType } from 'react'

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
  loading?: 'lazy' | 'eager'
  priority?: boolean
  resource?: MediaType | MediaType['id'] | null
  sizes?: string
  sizesPreset?: MediaSizesPreset
  src?: StaticImageData // for static media
  videoClassName?: string
}
