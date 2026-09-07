import type { VercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

declare module 'payload' {
  interface DatabaseAdapter {
    // Payload's base adapter leaves transaction connections opaque.
    sessions: {
      [id: string]: {
        db: VercelPostgresAdapter['drizzle']
        resolve: () => Promise<void>
        reject: () => Promise<void>
      }
    }
  }
}
