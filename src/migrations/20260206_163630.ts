import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "media_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_media_id" integer;
  ALTER TABLE "events" ADD CONSTRAINT "events_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_media_id_media_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_media_idx" ON "events" USING btree ("media_id");
  CREATE INDEX "_events_v_version_version_media_idx" ON "_events_v" USING btree ("version_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_media_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_media_id_media_id_fk";
  
  DROP INDEX "events_media_idx";
  DROP INDEX "_events_v_version_version_media_idx";
  ALTER TABLE "events" DROP COLUMN "media_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_media_id";`)
}
