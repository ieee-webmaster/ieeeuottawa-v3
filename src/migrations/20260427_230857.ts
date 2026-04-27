import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams_positions" ADD COLUMN "position_email" varchar;
  ALTER TABLE "people" DROP COLUMN "contact_email";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "people" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "teams_positions" DROP COLUMN "position_email";`)
}
