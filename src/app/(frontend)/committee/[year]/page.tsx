import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

/*
In the future:
- Set dynamic (force-static) and revalidate (false)
- Automatically revalidate when the user makes changes to the committee
- Add SEO
*/

export default async function CommitteePage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'committee',
    where: {
      Year: {
        equals: year,
      },
    },
    depth: 2,
    limit: 1,
  })

  const committee = result.docs[0]

  if (!committee) {
    notFound()
  }

  return (
    <div>
      <h1>{committee.Year} Committee</h1>

      {committee.teams?.map((teamEntry: any) => (
        <div key={teamEntry.id}>
          <h2>{teamEntry.team.name}</h2>

          {teamEntry.members?.map((member: any) => (
            <div key={member.id}>
              <strong>{member.role}:</strong> {member.person.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
