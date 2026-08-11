import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { Media } from '@/payload-types'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { getResponsiveImageData } from '@/components/Media/ImageMedia/responsive'

const updatedAt = '2026-08-08T20:27:40.013Z'

const createMedia = (overrides: Partial<Media> = {}): Media => ({
  alt: 'IEEE uOttawa',
  createdAt: updatedAt,
  height: 4000,
  id: 146,
  mimeType: 'image/jpeg',
  sizes: {
    large: {
      height: 933,
      url: 'https://media.example.com/hero-1400x933.jpg',
      width: 1400,
    },
    medium: {
      height: 600,
      url: 'https://media.example.com/hero-900x600.jpg',
      width: 900,
    },
    og: {
      height: 630,
      url: 'https://media.example.com/hero-1200x630.jpg',
      width: 1200,
    },
    small: {
      height: 400,
      url: 'https://media.example.com/hero-600x400.jpg',
      width: 600,
    },
    square: {
      height: 500,
      url: 'https://media.example.com/hero-500x500.jpg',
      width: 500,
    },
    thumbnail: {
      height: 200,
      url: 'https://media.example.com/hero-300x200.jpg',
      width: 300,
    },
    xlarge: {
      height: 1280,
      url: 'https://media.example.com/hero-1920x1280.jpg',
      width: 1920,
    },
  },
  updatedAt,
  url: 'https://media.example.com/hero.jpg',
  width: 6000,
  ...overrides,
})

describe('Payload responsive media', () => {
  it('uses aspect-preserving Payload sizes and avoids the oversized original', () => {
    const image = getResponsiveImageData(createMedia())

    expect(image?.src).toContain('hero-1920x1280.jpg')
    expect(image?.src).not.toContain('/hero.jpg')
    expect(image?.srcSet).toMatch(/ 300w,.* 600w,.* 900w,.* 1400w,.* 1920w/)
    expect(image?.srcSet).not.toContain('hero-500x500.jpg')
    expect(image?.srcSet).not.toContain('hero-1200x630.jpg')
    expect(image?.srcSet).toContain(encodeURIComponent(updatedAt))
  })

  it('falls back to the original URL when legacy media has no generated sizes', () => {
    const image = getResponsiveImageData(createMedia({ sizes: undefined }))

    expect(image).toMatchObject({
      height: 4000,
      src: expect.stringContaining('/hero.jpg'),
      width: 6000,
    })
    expect(image?.srcSet).toBeUndefined()
  })

  it('infers missing derivative heights from the original aspect ratio', () => {
    const image = getResponsiveImageData(
      createMedia({
        sizes: {
          small: {
            height: null,
            url: 'https://media.example.com/hero-900.webp',
            width: 900,
          },
        },
      }),
    )

    expect(image?.height).toBe(600)
  })

  it('renders priority CMS images without the Next runtime optimizer', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ImageMedia, {
        fill: true,
        priority: true,
        resource: createMedia(),
        sizesPreset: 'half',
      }),
    )

    expect(markup).toContain('srcSet=')
    expect(markup).toContain('sizes="(max-width: 768px) 100vw, 50vw"')
    expect(markup).toContain('fetchPriority="high"')
    expect(markup).toContain('loading="eager"')
    expect(markup).not.toContain('rel="preload"')
    expect(markup).not.toContain('/_next/image')
    expect(markup).not.toContain('hero.jpg?')
  })
})
