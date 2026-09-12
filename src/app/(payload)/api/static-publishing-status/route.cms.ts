import { publishingClient } from '@/utilities/staticPublishing'

export async function GET() {
  if (process.env.PRODUCTION_EDITOR !== '1') return Response.json({ phase: 'development' })
  const client = await publishingClient()
  try {
    const state = await client.query<{
      phase: string
      revision: string
      published_revision: string
      code_version: string
    }>('SELECT * FROM static_publishing.state WHERE id')
    const row = state.rows[0]
    return Response.json(
      {
        phase: row?.phase,
        pending: row?.revision !== row?.published_revision,
        matching: row?.code_version === process.env.STATIC_EDITOR_CODE_VERSION,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } finally {
    await client.end()
  }
}
