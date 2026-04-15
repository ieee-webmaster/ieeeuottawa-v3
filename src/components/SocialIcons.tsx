import type { Media, SocialLink } from '@/payload-types'

import { cn } from '@/utilities/ui'

interface Props {
  links: (number | SocialLink)[] | null | undefined
  className?: string
  iconClassName?: string
  linkClassName?: string
  showLabels?: boolean
  invert?: boolean
}

export const SocialIcons: React.FC<Props> = ({
  links,
  className,
  iconClassName,
  linkClassName,
  showLabels = false,
  invert = false,
}) => {
  const resolvedLinks =
    links?.filter((entry): entry is SocialLink => typeof entry === 'object') ?? []

  if (!resolvedLinks.length) return null

  return (
    <ul className={cn('flex items-center gap-3', className)}>
      {resolvedLinks.map((entry) => {
        const lightIcon = typeof entry.lightIcon === 'object' ? (entry.lightIcon as Media) : null
        const darkIcon = typeof entry.darkIcon === 'object' ? (entry.darkIcon as Media) : null
        const lightIconUrl = lightIcon?.url
        const darkIconUrl = darkIcon?.url

        if (!lightIconUrl || !darkIconUrl) return null

        return (
          <li key={entry.id ?? entry.url}>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={entry.label}
              className={cn(
                'inline-flex items-center justify-center text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                showLabels ? 'gap-2 rounded-full px-3 py-2' : 'rounded-full p-2',
                linkClassName,
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightIconUrl}
                alt=""
                aria-hidden="true"
                className={cn(
                  'h-5 w-5 object-contain',
                  invert ? 'hidden dark:block' : 'block dark:hidden',
                  iconClassName,
                )}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={darkIconUrl}
                alt=""
                aria-hidden="true"
                className={cn(
                  'h-5 w-5 object-contain',
                  invert ? 'block dark:hidden' : 'hidden dark:block',
                  iconClassName,
                )}
              />
              {showLabels && (
                <span className="whitespace-nowrap text-sm font-medium">{entry.label}</span>
              )}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
