import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import type { ImageProps } from 'next/image'

import type { Media, Person } from '@/payload-types'
import { PersonCard } from '@/components/PersonCard'

// Vite imports local images as URLs. Next's production build turns the same imports
// into StaticImageData and copies them to the export; keep this test about card selection.
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

describe('static committee portraits', () => {
  it.each([
    {
      fullName: 'Inès Bouchama',
      profile: 'https://www.linkedin.com/in/inesbouchama-creative-software-engineer/',
      role: 'Design Coordinator',
      filename: 'ines-bouchama-linkedin.jpg',
    },
    {
      fullName: 'Waaberi Ibrahim',
      profile: 'https://www.linkedin.com/in/waaberi/',
      role: 'Software Technical Coordinator',
      filename: 'waaberi-ibrahim-linkedin.png',
    },
  ])('renders $fullName with no CMS headshot', ({ fullName, profile, role, filename }) => {
    vi.stubEnv('STATIC_EXPORT', '1')
    const person = createPerson({ fullName, 'Linkedin Profile': profile, headshot: null })
    const before = structuredClone(person)

    renderPerson(person, role)

    expect(screen.getByRole('img', { name: fullName }).getAttribute('src')).toContain(filename)
    expect(screen.getByText(role)).toBeDefined()
    expect(screen.getByRole('link', { name: 'LinkedIn profile' }).getAttribute('href')).toBe(
      profile,
    )
    expect(person).toEqual(before)
  })

  it('replaces Mohamed’s populated old photo without mutating its CMS record', () => {
    vi.stubEnv('STATIC_EXPORT', '1')
    const person = createPerson()
    const before = structuredClone(person)

    renderPerson(person)

    expect(screen.getByRole('img', { name: person.fullName }).getAttribute('src')).toContain(
      'mohamed-boustta-linkedin.png',
    )
    expect(person).toEqual(before)
  })

  it('normalizes LinkedIn host, trailing slashes, and query parameters', () => {
    vi.stubEnv('STATIC_EXPORT', '1')
    const person = createPerson({
      'Linkedin Profile': 'https://linkedin.com/in/mohamed-boustta?trk=profile#about',
    })
    renderPerson(person)
    expect(screen.getByRole('img', { name: person.fullName }).getAttribute('src')).toContain(
      'mohamed-boustta-linkedin.png',
    )
  })

  it.each([
    null,
    'not a URL',
    'https://example.test/in/mohamed-boustta/',
    'https://www.linkedin.com/in/someone-else/',
  ])('keeps the CMS photo when the profile does not match (%s)', (profile) => {
    vi.stubEnv('STATIC_EXPORT', '1')
    const person = createPerson({ 'Linkedin Profile': profile })
    renderPerson(person)
    expect(screen.getByRole('img', { name: person.fullName }).getAttribute('src')).toBe(
      oldHeadshot.url,
    )
  })

  it.each([undefined, '0'])('preserves normal CMS photo rendering (STATIC_EXPORT=%s)', (value) => {
    vi.stubEnv('STATIC_EXPORT', value)
    const person = createPerson()
    renderPerson(person)
    expect(screen.getByRole('img', { name: person.fullName }).getAttribute('src')).toBe(
      oldHeadshot.url,
    )
  })

  it('preserves the normal CMS placeholder when a mapped person has no headshot', () => {
    vi.stubEnv('STATIC_EXPORT', '0')
    renderPerson(createPerson({ headshot: null }))
    expect(screen.queryByRole('img')).toBeNull()
  })
})
