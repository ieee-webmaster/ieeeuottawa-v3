import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Committee } from '@/payload-types'
import { CommitteeCard } from './_components/CommitteeCard'

export default async function CommitteeLanding() {
  const payload = await getPayload({ config: configPromise })

  const { docs: committees } = await payload.find({
    collection: 'committee',
    depth: 1,
    limit: 100,
    sort: '-Year',
  })

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-center">Committees</h1>
        <p className="mt-4 text-center text-xl text-muted-foreground max-w-[800px]">
          Behind every successful student association is a team of committed
          volunteers who share the common goal of enhancing EECS students' life on campus.
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8 border-b pb-4"></div>

        {committees.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-muted p-12 text-center">
            <p className="text-lg text-muted-foreground">No committee records found.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {committees.map((committee) => (
              <CommitteeCard key={committee.id} committee={committee} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}