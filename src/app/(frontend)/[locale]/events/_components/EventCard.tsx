import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import type { Event } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Locale } from '@/i18n/routing'

type Props = {
  event: Event
  locale: Locale
}

export const EventCard = ({ event, locale }: Props) => {
  const heroMedia = event.heroImage && typeof event.heroImage === 'object' ? event.heroImage : null
  const heroSrc = heroMedia?.url ? getMediaUrl(heroMedia.url, heroMedia.updatedAt) : null
  const eventDate = new Date(event.date)
  const validDate = !Number.isNaN(eventDate.valueOf())
  const month = validDate
    ? new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
        .format(eventDate)
        .toLocaleUpperCase(locale)
    : ''
  const day = validDate
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' }).format(eventDate)
    : ''

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/events/${encodeURIComponent(event.slug)}`} className="block h-full">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={heroMedia?.alt || event.title || 'Event image'}
            width={1200}
            height={630}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="h-56 w-full bg-muted" />
        )}

        <div className="px-4 py-3 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold leading-tight hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="mt-1 text-sm text-muted-foreground">{event.location}</div>
          </div>

          {validDate && (
            <div className="flex flex-col items-end text-right">
              <div className="text-xs text-muted-foreground">{month}</div>
              <div className="text-2xl font-bold leading-none">{day}</div>
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
