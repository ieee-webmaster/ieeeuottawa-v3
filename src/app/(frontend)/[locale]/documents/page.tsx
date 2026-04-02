import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { FolderArchive, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Event, Config } from '@/payload-types'

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

/*

export default async function EventsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise

*/

export default async function DocumentsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'docs',
    depth: 0,
    sort: '-year',
    limit: 100,
  })

  const IEEEBlue = '#03164f'
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'docs',
  })

  return (
    <main className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8 py-16">
      <header className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          {t('title')}
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed">
          {t('landingDescription')}
          {t('landingDescriptionCont')}
        </p>
      </header>

      {docs.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 bg-gray-50">
          {t('noYears')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.year}`}
              className="group flex items-center justify-between p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#03164f]/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col pr-4">
                <span className="text-4xl font-extrabold text-gray-900 group-hover:text-[#03164f] tracking-tight transition-colors">
                  {doc.year}
                </span>
                <span className="text-xs font-bold text-gray-400 mt-1.5 tracking-wider uppercase">
                  {t('archiveLabel') || 'View Archives'}
                </span>
              </div>

              <div className="w-14 h-14 shrink-0 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#03164f] transition-all duration-300">
                <ArrowRight className="w-6 h-6 text-[#03164f] group-hover:text-white transition-colors duration-300 " />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
