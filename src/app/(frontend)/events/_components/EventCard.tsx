import Link from 'next/link'
import Image from 'next/image'
import type { Event, Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
// I want this removed once we have more frontend components

type Props = {
  event: Event
}

const getEventImage = (event: Event): Media | null => {
  const heroImage = event.heroImage
  if (heroImage && typeof heroImage === 'object') return heroImage

  const media = event.Media
  if (media && typeof media === 'object') return media

  return null
}

export const EventCard = ({ event }: Props) => {
  const heroMedia = event.heroImage && typeof event.heroImage === 'object' ? event.heroImage : null
  const media = event.Media && typeof event.Media === 'object' ? event.Media : null
  const heroSrc = heroMedia?.url ? getMediaUrl(heroMedia.url, heroMedia.updatedAt) : null
  const mediaSrc = media?.url ? getMediaUrl(media.url, media.updatedAt) : null
  const now = new Date()
  const eventDate = new Date(event.date)
  const isPast = !Number.isNaN(eventDate.valueOf()) && eventDate < now

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #ddd' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        <Link href={`/events/${event.slug}`}>{event.title}</Link>
      </div>

      <div>{new Date(event.date).toLocaleDateString()}</div>
      <div>{event.location}</div>

      {!isPast && event.Link ? (
        <div style={{ marginTop: 6 }}>
          <a href={event.Link} target="_blank" rel="noreferrer">
            Sign up / Learn more
          </a>
        </div>
      ) : (
        mediaSrc && (
          <div style={{ marginTop: 10 }}>
            <Image
              src={mediaSrc}
              alt={media?.alt || ''}
              width={media?.width || 1200}
              height={media?.height || 630}
              style={{ maxWidth: 320, height: 'auto', display: 'block' }}
            />
          </div>
        )
      )}

      {heroSrc && (
        <div style={{ marginTop: 10 }}>
          <Image
            src={heroSrc}
            alt={heroMedia?.alt || ''}
            width={heroMedia?.width || 1200}
            height={heroMedia?.height || 630}
            style={{ maxWidth: 320, height: 'auto', display: 'block' }}
          />
        </div>
      )}
    </div>
  )
}
