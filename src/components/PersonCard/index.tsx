import { Linkedin, Mail, UserRound } from 'lucide-react'

import type { Person } from '@/payload-types'
import { Media } from '@/components/Media'
import { hasRenderableMediaSource } from '@/components/Media/hasRenderableMediaSource'
import { getStaticPortrait } from './staticPortraits'

type Props = {
  person: Person
  role: string
  rank?: string
  positionEmail?: string | null
  emailLabel: string
  linkedinLabel: string
}

export function PersonCard({
  person,
  role,
  rank,
  positionEmail,
  emailLabel,
  linkedinLabel,
}: Props) {
  const staticPortrait = getStaticPortrait(person['Linkedin Profile'])
  const headshot =
    person.headshot &&
    typeof person.headshot !== 'number' &&
    hasRenderableMediaSource(person.headshot)
      ? person.headshot
      : null

  return (
    <article className="min-w-0">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {staticPortrait || headshot ? (
          <Media
            fill
            htmlElement={null}
            resource={staticPortrait ? undefined : headshot}
            src={staticPortrait}
            alt={person.fullName}
            imgClassName="object-cover object-top"
            pictureClassName="absolute inset-0"
            sizesPreset="portraitGrid"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UserRound className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-display text-lg font-medium leading-snug">{person.fullName}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{role}</p>
        {rank && rank.toLocaleLowerCase() !== role.toLocaleLowerCase() && (
          <p className="text-xs leading-relaxed text-muted-foreground">{rank}</p>
        )}
      </div>
      {(positionEmail || person['Linkedin Profile']) && (
        <div className="-ml-2 mt-1 flex items-center">
          {positionEmail && (
            <a
              href={`mailto:${positionEmail}`}
              aria-label={emailLabel}
              className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {person['Linkedin Profile'] && (
            <a
              href={person['Linkedin Profile']}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={linkedinLabel}
              className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  )
}
