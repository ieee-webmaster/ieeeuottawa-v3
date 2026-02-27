import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import type { Committee, Team, Person, Config } from '@/payload-types'

/*
In the future:
- Set dynamic (force-static) and revalidate (false)
- Automatically revalidate when the user makes changes to the committee
- Add SEO
*/

export default async function CommitteePage({ params }: { params: Promise<{ locale: Config['locale']; year: string }> }) {
  const { locale, year } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'committee',
    where: {
      Year: {
        equals: year,
      },
    },
    depth: 2,
    locale,
    limit: 1,
  })

  const committee = result.docs[0] as Committee

  if (!committee) {
    notFound()
  }

  return (
    <div>
      <h1>{committee.Year} Committee</h1>

      {committee.teams?.map((teamEntry) => (
        <div key={teamEntry.id}>
          <h2>{(teamEntry.team as Team).name}</h2>

          {teamEntry.members?.map((member) => (
            <div key={member.id}>
              <strong>{member.role}:</strong> {(member.person as Person).fullName}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
