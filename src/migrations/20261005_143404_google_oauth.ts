import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "google_id" varchar;
  CREATE UNIQUE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");
  DELETE FROM "users_sessions";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_google_id_idx";
  ALTER TABLE "users" DROP COLUMN "google_id";`)
}
