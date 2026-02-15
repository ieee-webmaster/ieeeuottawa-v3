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

  // sort upcoming events soonest-first
  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // sort past events newest-first
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-center">Events</h1>
        <p className="mt-2 text-gray-300 text-center">
          Browse upcoming and past events organized by IEEE UOttawa.
        </p>
      </header>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Upcoming</h2>
          <div className="text-sm text-gray-500">
            {upcoming.length} event{upcoming.length !== 1 ? 's' : ''}
          </div>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-600">
            No upcoming events.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Past</h2>
          <div className="text-sm text-gray-500">
            {past.length} event{past.length !== 1 ? 's' : ''}
          </div>
        </div>

        {past.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-600">
            No past events.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
