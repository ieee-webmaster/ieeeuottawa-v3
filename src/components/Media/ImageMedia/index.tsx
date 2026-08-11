'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { mediaSizes } from '../sizes'
import { getResponsiveImageData } from './responsive'

const isSvgPath = (value: string) => {
  try {
    return new URL(value, 'http://localhost').pathname.toLowerCase().endsWith('.svg')
  } catch {
    return false
  }
}

const StaticImage: React.FC<{
  alt: string
  fill?: boolean
  imgClassName?: string
  loading?: 'eager' | 'lazy'
  pictureClassName?: string
  priority?: boolean
  sizes: string
  src: StaticImageData
}> = ({ alt, fill, imgClassName, loading, pictureClassName, priority, sizes, src }) => {
  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt}
        className={cn(imgClassName)}
        fill={fill}
        loading={priority ? undefined : (loading ?? 'lazy')}
        placeholder={src.blurDataURL ? 'blur' : 'empty'}
        preload={priority}
        sizes={sizes}
        src={src}
      />
    </picture>
  )
}

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    imgClassName,
    loading: loadingFromProps,
    pictureClassName,
    priority,
    resource,
    sizes: sizesFromProps,
    sizesPreset,
    src: srcFromProps,
  } = props

  const sizes = sizesFromProps ?? mediaSizes[sizesPreset ?? 'full']

  if (srcFromProps) {
    return (
      <StaticImage
        alt={altFromProps ?? ''}
        fill={fill}
        imgClassName={imgClassName}
        loading={loadingFromProps}
        pictureClassName={pictureClassName}
        priority={priority}
        sizes={sizes}
        src={srcFromProps}
      />
    )
  }

  if (!resource || typeof resource !== 'object') return null

  const alt = altFromProps ?? resource.alt ?? ''
  const isSvg = resource.mimeType === 'image/svg+xml' || isSvgPath(resource.url ?? '')

  if (isSvg) {
    if (!resource.url) return null

    return (
      <picture className={cn(pictureClassName)}>
        <img
          alt={alt}
          className={cn(fill && 'absolute inset-0 h-full w-full', imgClassName)}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          height={fill ? undefined : (resource.height ?? undefined)}
          loading={priority ? 'eager' : (loadingFromProps ?? 'lazy')}
          src={getMediaUrl(resource.url, resource.updatedAt)}
          width={fill ? undefined : (resource.width ?? undefined)}
        />
      </picture>
    )
  }

  const image = getResponsiveImageData(resource)
  if (!image) return null

  return (
    <picture className={cn(pictureClassName)}>
      <img
        alt={alt}
        className={cn(fill && 'absolute inset-0 h-full w-full', imgClassName)}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        height={fill ? undefined : image.height}
        loading={priority ? 'eager' : (loadingFromProps ?? 'lazy')}
        sizes={image.srcSet ? sizes : undefined}
        src={image.src}
        srcSet={image.srcSet}
        width={fill ? undefined : image.width}
      />
    </picture>
  )
}
