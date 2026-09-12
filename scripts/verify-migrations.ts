import { migrations } from '../src/migrations'
import { publishingClient } from '../src/utilities/staticPublishing'

const client = await publishingClient()
try {
  const result = await client.query<{ name: string }>(
    'SELECT name FROM payload_migrations WHERE batch >= 0',
  )
  const applied = new Set(result.rows.map((row) => row.name))
  const missing = migrations.filter((migration) => !applied.has(migration.name))
  if (missing.length)
    throw new Error(
      `Unapplied migrations: ${missing.map((migration) => migration.name).join(', ')}. Static export stopped.`,
    )
  console.log(`Verified ${migrations.length} committed migrations are applied`)
} finally {
  await client.end()
}
