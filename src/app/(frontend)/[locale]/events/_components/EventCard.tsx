import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import type { Event } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/utilities/ui'

type Props = {
  event: Event
  locale: Locale
  index?: number
  total?: number
}

export const EventCard = ({ event, locale, index, total }: Props) => {
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
  const year = validDate
    ? new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: 'UTC' }).format(eventDate)
    : ''

  const indexLabel =
    typeof index === 'number' && typeof total === 'number'
      ? `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
      : null

  return (
    <article className="group flex h-full flex-col gap-5">
      <Link
        href={`/events/${encodeURIComponent(event.slug)}`}
        className="flex h-full flex-col gap-5"
      >
        <div className="relative overflow-hidden">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={heroMedia?.alt || event.title || 'Event image'}
              width={1200}
              height={900}
              className={cn(
                'aspect-[4/3] w-full bg-foreground/5 object-cover',
                'transition-transform duration-700 ease-out group-hover:scale-[1.04]',
              )}
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-foreground/[0.04]">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-foreground/40">
                No image
              </span>
            </div>
          )}

          {indexLabel ? (
            <span className="absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-1 font-mono text-[0.7rem] tracking-[0.2em] text-white backdrop-blur-sm">
              {indexLabel}
            </span>
          ) : null}

          {validDate ? (
            <div className="absolute bottom-3 right-3 flex items-end gap-2 rounded-sm bg-white/85 px-2.5 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground/65">
                {month}
              </span>
              <span className="text-2xl font-medium leading-none tracking-tight text-foreground">
                {day}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground/55">
                {year}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {event.location ? (
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary">
              {event.location}
            </p>
          ) : null}
          <h3 className="text-balance text-xl font-medium leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary md:text-2xl">
            {event.title}
          </h3>
        </div>
      </Link>
    </article>
  )
}
