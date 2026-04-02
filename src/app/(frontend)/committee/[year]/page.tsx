import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, Linkedin, User } from 'lucide-react'
import type { Committee, Team, Person, Media } from '@/payload-types'

export default async function CommitteePage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'committee',
    where: { Year: { equals: year } },
    depth: 2,
    limit: 1,
  })

  const committee = result.docs[0] as Committee
  if (!committee) notFound()

  const executives: any[] = []
  const commissioners: any[] = []
  const coordinators: any[] = []

  committee.teams?.forEach((teamEntry) => {
    const team = teamEntry.team as Team
    teamEntry.members?.forEach((member) => {
      const positionDef = team.positions?.find(p => p.positionTitle === member.role)
      const level = positionDef?.role
      
      const personData = {
        ...member,
        teamName: team.name
      }

      if (level === 'exec') executives.push(personData)
      else if (level === 'commish') commissioners.push(personData)
      else coordinators.push(personData)
    })
  })

  const hasNoData = executives.length === 0 && commissioners.length === 0 && coordinators.length === 0;

  const sections = [
    { title: 'Executives', data: executives },
    { title: 'Commissioners', data: commissioners },
    { title: 'Coordinators', data: coordinators },
  ]

  return (
    <main className="max-w-[1400px] m-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <Link href="/committee" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-4 transition-colors group">
          <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Back to Archives
        </Link>
        <header>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            {committee.Year} Committee
          </h1>
        </header>
      </div>

      {hasNoData ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6">
            <User className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-foreground">Team Data Pending</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            The team for the <strong>{committee.Year}</strong> academic year hasn't been finalized in the system yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {sections.map((section) => (
            section.data.length > 0 && (
              <section key={section.title}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-foreground/50">
                    {section.title}
                  </h2>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
                  {section.data.map((member) => {
                    const person = member.person as Person
                    const headshot = person.headshot as Media | undefined

                    return (
                      <div key={member.id} className="group flex flex-col items-center text-center">
                        <div className="relative w-40 h-40 mb-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors">
                          {headshot?.url ? (
                            <Image
                              src={headshot.url}
                              alt={person.fullName}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                            {member.role}
                          </span>
                          <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                            {person.fullName}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-medium italic opacity-80">
                            {member.teamName}
                          </p>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {person['Contact Email'] && (
                            <a href={`mailto:${person['Contact Email']}`} className="p-1.5 rounded-md text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all">
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {person['Linkedin Profile'] && (
                            <a href={person['Linkedin Profile']} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          ))}
        </div>
      )}
    </main>
  )
}