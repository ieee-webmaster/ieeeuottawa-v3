import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import type { Event, Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import Link from 'next/link'
import RichText from '@/components/RichText'

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

  const heroMedia = event.heroImage && typeof event.heroImage === 'object' ? (event.heroImage as Media) : null
  const extraMedia = event.Media && typeof event.Media === 'object' ? (event.Media as Media) : null
  const heroSrc = heroMedia?.url ? getMediaUrl(heroMedia.url, heroMedia.updatedAt) : null
  const extraSrc = extraMedia?.url ? getMediaUrl(extraMedia.url, extraMedia.updatedAt) : null

  const eventDate = new Date(event.date)
  const dateStr = !Number.isNaN(eventDate.valueOf()) ? eventDate.toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <article>
      {/* Header */}
      <header className="w-full bg-gray-900 text-white relative">
        <Link
          href="/events"
          className={`${heroSrc ? 'text-white bg-black/20 hover:bg-black/30' : 'text-gray-800 bg-white/0 hover:bg-gray-100'} absolute top-4 left-4 z-40 inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          aria-label="Back to events"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        {heroSrc ? (
          <div className="relative w-full h-80 lg:h-[420px]">
            <img src={heroSrc} alt={heroMedia?.alt || event.title} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 right-4 bottom-6 lg:bottom-12 text-white">
              <h1 className="text-3xl lg:text-5xl font-extrabold">{event.title}</h1>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm lg:text-base">
                <div>{dateStr}</div>
                <div className="text-gray-200">•</div>
                <div>{event.location}</div>
                {event['hosted-by'] && typeof event['hosted-by'] === 'object' && (
                  <>
                    <div className="text-gray-200">•</div>
                    <div>Hosted by {(event['hosted-by'] as any).name}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <h1 className="text-2xl font-bold">{event.title}</h1>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {/* Rich text content */}
          {event.content && (
            <div>
              <h3 className="text-xl font-bold">About</h3>
              <RichText data={event.content as any} className="m-0 p-0"/>
            </div>
          )}
        </div>

        {/* Extra media / gallery */}
        {extraSrc && (
          <div className="mt-8">
            <h3 className="text-xl font-bold">Media</h3>
            <img src={extraSrc} alt={extraMedia?.alt || ''} className="w-full rounded-lg object-cover" />
          </div>
        )}

        {/* External link / signup */}
        {event.Link && (
          <div className="mt-8 text-center">
            <a
              href={event.Link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Sign up / Learn more
            </a>
          </div>
        )}
      </main>
    </article>
  )
}
