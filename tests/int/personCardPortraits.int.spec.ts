import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import type { ImageProps } from 'next/image'

import type { Media, Person } from '@/payload-types'
import { PersonCard } from '@/components/PersonCard'

// Keep this regression focused on CMS relationship selection in both build modes.
vi.mock('next/image', () => ({
  default: ({ src, alt }: Pick<ImageProps, 'src' | 'alt'>) =>
    createElement('img', {
      alt,
      src: typeof src === 'string' ? src : 'default' in src ? src.default.src : src.src,
    }),
}))

const oldHeadshot: Media = {
  id: 79,
  filename: 'mohamed-boustta.jpg',
  url: '/media/mohamed-boustta.jpg',
  mimeType: 'image/jpeg',
  width: 997,
  height: 997,
  createdAt: '',
  updatedAt: '',
}

const createPerson = (overrides: Partial<Person> = {}): Person => ({
  id: 81,
  fullName: 'Mohamed Boustta',
  'Linkedin Profile': 'https://www.linkedin.com/in/mohamed-boustta/',
  headshot: oldHeadshot,
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

const renderPerson = (person: Person, role = 'Technical Coordinator') =>
  render(
    createElement(PersonCard, {
      person,
      role,
      emailLabel: 'Email member',
      linkedinLabel: 'LinkedIn profile',
    }),
  )

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('CMS-owned committee portraits', () => {
  it.each(['1', '0'])('reflects CMS replacement and removal (STATIC_EXPORT=%s)', (mode) => {
    vi.stubEnv('STATIC_EXPORT', mode)
    const person = createPerson()
    const view = renderPerson(person)
    expect(screen.getByRole('img', { name: person.fullName }).getAttribute('src')).toBe(
      oldHeadshot.url,
    )

    const replacement: Media = {
      ...oldHeadshot,
      id: 200,
      filename: 'new-headshot.png',
      url: '/media/new-headshot.png',
    }
    view.rerender(
      createElement(PersonCard, {
        person: { ...person, headshot: replacement },
        role: 'Technical Coordinator',
        emailLabel: 'Email member',
        linkedinLabel: 'LinkedIn profile',
      }),
    )
    expect(screen.getByRole('img', { name: person.fullName }).getAttribute('src')).toBe(
      replacement.url,
    )
    view.rerender(
      createElement(PersonCard, {
        person: { ...person, headshot: null },
        role: 'Technical Coordinator',
        emailLabel: 'Email member',
        linkedinLabel: 'LinkedIn profile',
      }),
    )
    expect(screen.queryByRole('img')).toBeNull()
    expect(person.headshot).toEqual(oldHeadshot)
  })

  it.each([
    ['Inès Bouchama', 'https://www.linkedin.com/in/inesbouchama-creative-software-engineer/'],
    ['Waaberi Ibrahim', 'https://www.linkedin.com/in/waaberi/'],
    ['Mohamed Boustta', 'https://www.linkedin.com/in/mohamed-boustta/'],
  ])('never overrides %s based on their profile URL', (fullName, profile) => {
    vi.stubEnv('STATIC_EXPORT', '1')
    renderPerson(createPerson({ fullName, 'Linkedin Profile': profile, headshot: null }))
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('link', { name: 'LinkedIn profile' }).getAttribute('href')).toBe(
      profile,
    )
  })
})
