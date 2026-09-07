import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'

import type { Media, Page } from '@/payload-types'

vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@payloadcms/ui/icons/Copy', () => ({ CopyIcon: () => null }))

import { HighImpactHero } from '@/heros/HighImpact'
import styles from '@/heros/HighImpact/index.module.css'

const media: Media = {
  id: 146,
  alt: 'Our student branch',
  url: '/team.jpg',
  mimeType: 'image/jpeg',
  width: 6000,
  height: 4000,
  createdAt: '',
  updatedAt: '',
}

const links: Page['hero']['links'] = [
  {
    link: {
      type: 'custom',
      url: '/about',
      label: 'Explore the branch',
      appearance: 'default',
    },
  },
]

afterEach(cleanup)

describe('High impact hero circuit decoration', () => {
  it.each([undefined, null, true])(
    'keeps circuits enabled for new and older pages (%s)',
    (showCircuits) => {
      const { container } = render(
        createElement(HighImpactHero, { type: 'highImpact', media, showCircuits }),
      )
      expect(container.querySelectorAll(`.${styles.circuit}`)).toHaveLength(2)
    },
  )

  it('removes the decoration and animation when disabled, preserving the image and links', () => {
    const { container } = render(
      createElement(HighImpactHero, { type: 'highImpact', media, links, showCircuits: false }),
    )
    expect(container.querySelector(`.${styles.circuit}`)).toBeNull()
    expect(container.querySelector(`.${styles.signal}`)).toBeNull()
    expect(screen.getByRole('img', { name: 'Our student branch' }).getAttribute('src')).toBe(
      '/team.jpg',
    )
    expect(screen.getByRole('link', { name: 'Explore the branch' }).getAttribute('href')).toBe(
      '/about',
    )
  })
})

describe('High impact hero image framing', () => {
  it('renders older pages without framing settings using the original media', () => {
    const { container } = render(createElement(HighImpactHero, { type: 'highImpact', media }))
    const image = screen.getByRole('img', { name: 'Our student branch' })
    expect(image.getAttribute('src')).toBe('/team.jpg')
    expect(image.getAttribute('fetchpriority')).toBe('high')
    const frame = container.querySelector<HTMLElement>(`.${styles.media}`)
    expect(frame?.style.getPropertyValue('--hero-desktop-x')).toBe('50%')
    expect(frame?.style.getPropertyValue('--hero-mobile-zoom')).toBe('1')
  })

  it('keeps desktop and mobile crops independent and preserves a position of zero', () => {
    const { container } = render(
      createElement(HighImpactHero, {
        type: 'highImpact',
        media,
        imagePosition: {
          desktop: { x: 0, y: 100, zoom: 150 },
          mobile: { x: 100, y: 0, zoom: 110 },
        },
      }),
    )
    const frame = container.querySelector<HTMLElement>(`.${styles.media}`)
    expect(frame?.style.getPropertyValue('--hero-desktop-x')).toBe('0%')
    expect(frame?.style.getPropertyValue('--hero-desktop-y')).toBe('100%')
    expect(frame?.style.getPropertyValue('--hero-desktop-zoom')).toBe('1.5')
    expect(frame?.style.getPropertyValue('--hero-mobile-x')).toBe('100%')
    expect(frame?.style.getPropertyValue('--hero-mobile-y')).toBe('0%')
    expect(frame?.style.getPropertyValue('--hero-mobile-zoom')).toBe('1.1')
  })

  it.each([null, 146])(
    'keeps links usable without a populated media relationship (%s)',
    (media) => {
      const { container } = render(
        createElement(HighImpactHero, { type: 'highImpact', media, links }),
      )
      expect(container.querySelector(`.${styles.withMedia}`)).toBeNull()
      expect(screen.queryByRole('img')).toBeNull()
      expect(screen.getByRole('link', { name: 'Explore the branch' }).getAttribute('href')).toBe(
        '/about',
      )
    },
  )
})
