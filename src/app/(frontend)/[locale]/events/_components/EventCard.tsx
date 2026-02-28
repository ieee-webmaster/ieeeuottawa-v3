import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import type { Event } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
// I want this removed once we have more frontend components

type Props = {
  event: Event
}

export const EventCard = ({ event }: Props) => {
  const heroMedia = event.heroImage && typeof event.heroImage === 'object' ? event.heroImage : null
  const heroSrc = heroMedia?.url ? getMediaUrl(heroMedia.url, heroMedia.updatedAt) : null
  const eventDate = new Date(event.date)
  const validDate = !Number.isNaN(eventDate.valueOf())
  const month = validDate ? eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : ''
  const day = validDate ? String(eventDate.getDate()) : ''

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
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
          <h3 className="text-lg font-semibold leading-tight">
            <Link href={`/events/${event.slug}`} className="transition-colors hover:text-primary">
              {event.title}
            </Link>
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
    </article>
  )
}
