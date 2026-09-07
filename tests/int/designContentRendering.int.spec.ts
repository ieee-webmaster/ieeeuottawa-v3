import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'

import type { LogoGridBlock as LogoGridData, Page } from '@/payload-types'

vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@payloadcms/ui/icons/Copy', () => ({ CopyIcon: () => null }))

import { LogoGridBlock } from '@/blocks/LogoGrid/Component'
import { AffinityGroupHero } from '@/heros/AffinityGroup'
import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'

afterEach(cleanup)

describe('CMS content retained by the design pass', () => {
  it.each(['grid', 'featured'] as const)('retains authored sponsor content in %s mode', (style) => {
    const block: LogoGridData = {
      blockType: 'logoGrid',
      title: 'Our partners',
      eyebrow: 'Student support',
      style,
      theme: 'default',
      items: [
        {
          name: 'Example Foundation',
          logo: {
            id: 7,
            alt: 'Example Foundation',
            url: '/foundation.svg',
            mimeType: 'image/svg+xml',
            width: 512,
            height: 512,
            createdAt: '',
            updatedAt: '',
          },
          description: 'Funds student projects.',
          enableLink: true,
          link: {
            type: 'custom',
            url: 'https://example.test/grants',
            label: 'Explore grants',
            newTab: true,
          },
        },
      ],
    }
    render(createElement(LogoGridBlock, block))
    expect(screen.getByText('Student support')).toBeDefined()
    expect(screen.getByText('Example Foundation')).toBeDefined()
    expect(screen.getByText('Funds student projects.')).toBeDefined()
    expect(screen.getByText('Explore grants')).toBeDefined()
    const link = screen.getByRole('link', { name: /Explore grants/ })
    expect(link.getAttribute('href')).toBe('https://example.test/grants')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it.each([
    ['affinity', AffinityGroupHero],
    ['high impact', HighImpactHero],
    ['low impact', LowImpactHero],
    ['medium impact', MediumImpactHero],
  ] as const)('preserves editor list formatting in the %s hero', (_name, Hero) => {
    const richText: NonNullable<Page['hero']['richText']> = {
      root: {
        type: 'root',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        children: [
          {
            type: 'list',
            version: 1,
            tag: 'ul',
            listType: 'bullet',
            start: 1,
            direction: null,
            format: '',
            indent: 0,
            children: [
              {
                type: 'listitem',
                version: 1,
                value: 1,
                direction: null,
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: 'Bring your project',
                    format: 0,
                    style: '',
                    mode: 'normal',
                    detail: 0,
                  },
                ],
              },
            ],
          },
        ],
      },
    }
    render(createElement(Hero, { type: 'lowImpact', richText }))
    expect(screen.getByRole('listitem').textContent).toBe('Bring your project')
    expect(screen.getByRole('list').closest('.prose')).not.toBeNull()
  })
})
