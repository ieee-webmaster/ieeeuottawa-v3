import { Doc } from '@/payload-types'

const formatUrl = (url?: string) => {
  if (!url) return
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null
  return new Date(dateString).toISOString().split('T')[0]
}

export function YearlyDocument(docs: Doc) {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 space-y-12 py-8">
      {(docs.generalDocuments ?? []).length > 0 && (
        <section>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            General Documents
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.generalDocuments?.map((doc) => (
              <a
                key={doc.id || doc.name}
                href={formatUrl(doc.googleDocsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white border border-gray-200 hover:border-[#03164f] hover:shadow-sm rounded-xl transition-all duration-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.name}</h3>
                {doc.description && (
                  <p className="text-sm text-gray-500 leading-snug">{doc.description}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
      {(docs.meetingMinutes ?? []).length > 0 && (
        <section>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            Meeting Minutes
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.meetingMinutes?.map((minute) => (
              <a
                key={minute.id || minute.name}
                href={formatUrl(minute.googleDocsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white border border-gray-200 hover:border-[#03164f] hover:shadow-sm rounded-xl transition-all duration-200"
              >
                <h3 className="text-lg font-bold text-gray-900">{minute.name}</h3>
                {minute.meetingDate && (
                  <p className="text-xs font-semibold text-[#03164f]/80 mt-1 uppercase tracking-wider">
                    {formatDate(minute.meetingDate)}
                  </p>
                )}
                {minute.description && (
                  <p className="text-sm text-gray-500 mt-2 leading-snug">{minute.description}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}{' '}
      {(docs.otherDocuments ?? []).length > 0 && (
        <section>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
            Other Documents
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.otherDocuments?.map((doc) => (
              <a
                key={doc.id || doc.name}
                href={formatUrl(doc.googleDocsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white border border-gray-200 hover:border-[#03164f] hover:shadow-sm rounded-xl transition-all duration-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.name}</h3>
                {doc.description && (
                  <p className="text-sm text-gray-500 leading-snug">{doc.description}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
