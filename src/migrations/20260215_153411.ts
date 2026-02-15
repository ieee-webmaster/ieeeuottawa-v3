import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" RENAME COLUMN "link" TO "signup_link";
  ALTER TABLE "_events_v" RENAME COLUMN "version_link" TO "version_signup_link";
  ALTER TABLE "events" ADD COLUMN "media_link" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_media_link" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "link" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_link" varchar;
  ALTER TABLE "events" DROP COLUMN "signup_link";
  ALTER TABLE "events" DROP COLUMN "media_link";
  ALTER TABLE "_events_v" DROP COLUMN "version_signup_link";
  ALTER TABLE "_events_v" DROP COLUMN "version_media_link";`)
}
