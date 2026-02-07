import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import type { Event, Media } from '@/payload-types'
import { EventCard } from '../_components/EventCard'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
    limit: 1,
  })

  const event = result.docs[0] as Event | undefined

  if (!event) {
    notFound()
  }

  return (
    <div>
      <EventCard event={event} />
    </div>
  )
}
