import { createElement } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { router } = vi.hoisted(() => ({
  router: { replace: (href: string) => window.history.replaceState(null, '', `/fr${href}`) },
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => router,
}))

import { Search } from '@/search/Component'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('search interactions', () => {
  it('clears a submitted query before its typing debounce has elapsed', () => {
    vi.useFakeTimers()
    window.history.replaceState(null, '', '/fr/search')
    render(createElement(Search))

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'IEEE' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(window.location.search).toBe('?q=IEEE')

    fireEvent.click(screen.getByRole('button', { name: 'clear' }))
    act(() => vi.advanceTimersByTime(250))

    expect(window.location.pathname).toBe('/fr/search')
    expect(window.location.search).toBe('')
    expect(screen.queryByRole('button', { name: 'clear' })).toBeNull()
  })
})
