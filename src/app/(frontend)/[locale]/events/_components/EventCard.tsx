import { formatEventLocation } from '@/utilities/formatEventLocation'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Media } from '@/components/Media'
import type { EventListItem } from '@/utilities/publicCms'

type Props = {
  event: EventListItem
  locale: Locale
}

export const EventCard = ({ event, locale }: Props) => {
  const heroMedia = event.heroImage && typeof event.heroImage !== 'number' ? event.heroImage : null
  const eventDate = new Date(event.date)
  const validDate = !Number.isNaN(eventDate.valueOf())

  return (
    <article className="min-w-0">
      <Link
        href={`/events/${encodeURIComponent(event.slug)}`}
        className="group flex h-full flex-col gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {heroMedia && (
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Media
              fill
              htmlElement={null}
              resource={heroMedia}
              alt={heroMedia.alt || event.title}
              imgClassName="object-contain"
              pictureClassName="absolute inset-0"
              sizesPreset="third"
            />
          </div>
        )}
        <div className="space-y-2">
          {validDate && (
            <time dateTime={event.date} className="font-mono text-xs text-muted-foreground">
              {formatDateTime(event.date, locale)}
            </time>
          )}
          <h3 className="font-display text-xl font-medium leading-snug group-hover:underline underline-offset-4">
            {event.title}
          </h3>
          {event.location && (
            <p className="break-words text-sm leading-relaxed text-muted-foreground">
              {formatEventLocation(event.location)}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
