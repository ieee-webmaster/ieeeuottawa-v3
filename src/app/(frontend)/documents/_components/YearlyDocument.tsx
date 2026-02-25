import { Doc } from '@/payload-types'

export function YearlyDocument(docs: Doc) {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{docs.year} Documents</h1>

      {(docs.generalDocuments ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">General Documents</h2>
          <ul className="list-disc list-inside">
            {(docs.generalDocuments ?? []).map((doc) => (
              <li key={doc.name} className="mb-2">
                <a href={doc.googleDocsUrl} download className="text-blue-600 underline">
                  {doc.name}
                </a>
                {doc.description && <p className="text-sm text-gray-600">{doc.description}</p>}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mb-4 mt-8">Meeting Minutes</h2>
          <ul className="list-disc list-inside">
            {(docs.meetingMinutes ?? []).map((doc) => (
              <li key={doc.name} className="mb-2">
                <a href={doc.googleDocsUrl} download className="text-blue-600 underline">
                  {doc.name}
                </a>
                {doc.meetingDate && (
                  <p className="text-sm text-gray-600">Meeting Date: {doc.meetingDate}</p>
                )}
                {doc.description && <p className="text-sm text-gray-600">{doc.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
