import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'

import { CodeBlock } from '@/blocks/Code/Component'
import type { CMSLink } from '@/components/Link'

// Payload's icon imports admin SCSS that is unrelated to code rendering.
vi.mock('@payloadcms/ui/icons/Copy', () => ({ CopyIcon: () => null }))

afterEach(cleanup)

describe('CMS content contracts', () => {
  it.each([null, undefined, 'javascript'] as const)('renders code with language %s', (language) => {
    const view = render(
      createElement(CodeBlock, { blockType: 'code', code: 'const answer = 42', language }),
    )
    expect(view.container.querySelector('pre')?.textContent).toContain('const answer = 42')
    expect(view.getByRole('button', { name: 'Copy' })).toBeTruthy()
  })

  it('rejects unsupported link collections and malformed populated documents at compile time', () => {
    type Reference = NonNullable<ComponentProps<typeof CMSLink>['reference']>
    expectTypeOf<{ relationTo: 'pages'; value: number }>().toExtend<Reference>()
    expectTypeOf<{ relationTo: 'unsupported'; value: number }>().not.toExtend<Reference>()
    expectTypeOf<{ relationTo: 'pages'; value: { arbitrary: string } }>().not.toExtend<Reference>()
  })
})
