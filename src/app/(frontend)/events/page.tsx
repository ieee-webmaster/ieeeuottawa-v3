import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Event } from '@/payload-types'
import { EventCard } from './_components/EventCard'

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 100,
    sort: 'date',
  })

  const now = new Date()

  const upcoming: Event[] = []
  const past: Event[] = []

  for (const doc of docs as Event[]) {
    const eventDate = new Date(doc.date)

    if (!Number.isNaN(eventDate.valueOf()) && eventDate >= now) {
      upcoming.push(doc)
    } else {
      past.push(doc)
    }
  }

  return (
    <div>
      <h1>Events</h1>

      <h2>Upcoming</h2>
      {upcoming.length === 0 ? (
        <div>No upcoming events.</div>
      ) : (
        upcoming.map((event) => <EventCard key={event.id} event={event} />)
      )}

      <h2>Past</h2>
      {past.length === 0 ? (
        <div>No past events.</div>
      ) : (
        past
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((event) => <EventCard key={event.id} event={event} />)
      )}
    </div>
  )
}
