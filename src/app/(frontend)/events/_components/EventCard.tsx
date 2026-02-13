import Link from 'next/link'
import Image from 'next/image'
import type { Event } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
// I want this removed once we have more frontend components

type Props = {
  event: Event
}

export const EventCard = ({ event }: Props) => {
  const heroMedia = event.heroImage && typeof event.heroImage === 'object' ? event.heroImage : null
  const media = event.Media && typeof event.Media === 'object' ? event.Media : null
  const heroSrc = heroMedia?.url ? getMediaUrl(heroMedia.url, heroMedia.updatedAt) : null
  const mediaSrc = media?.url ? getMediaUrl(media.url, media.updatedAt) : null
  const now = new Date()
  const eventDate = new Date(event.date)
  const validDate = !Number.isNaN(eventDate.valueOf())
  const month = validDate ? eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : ''
  const day = validDate ? String(eventDate.getDate()) : ''

  return (
    <article className="rounded-lg overflow-hidden shadow-sm bg-[#222]">
      {heroSrc ? (
        <Image
          src={heroSrc}
          alt={heroMedia?.alt || event.title || 'Event image'}
          width={1200}
          height={630}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-gray-400" />
      )}

      <div className="px-4 py-3 flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold leading-tight">
            <Link href={`/events/${event.slug}`}>{event.title}</Link>
          </h3>
          <div className="text-sm text-gray-400 mt-1">{event.location}</div>
        </div>

        {validDate && (
          <div className="flex flex-col items-end text-right">
            <div className="text-xs text-gray-400">{month}</div>
            <div className="text-2xl font-bold leading-none">{day}</div>
          </div>
        )}
      </div>
    </article>
  )
}
