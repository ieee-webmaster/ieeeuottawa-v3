import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" RENAME COLUMN "link" TO "signup_link";
  ALTER TABLE "_events_v" RENAME COLUMN "version_link" TO "version_signup_link";
  ALTER TABLE "events" DROP CONSTRAINT "events_hosted_by_id_teams_id_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_media_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_hosted_by_id_teams_id_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_media_fk";
  
  DROP INDEX "events_hosted_by_idx";
  DROP INDEX "events_rels_media_id_idx";
  DROP INDEX "_events_v_version_version_hosted_by_idx";
  DROP INDEX "_events_v_rels_media_id_idx";
  ALTER TABLE "events" ADD COLUMN "media_link" varchar;
  ALTER TABLE "events_rels" ADD COLUMN "teams_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_media_link" varchar;
  ALTER TABLE "_events_v_rels" ADD COLUMN "teams_id" integer;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_rels_teams_id_idx" ON "events_rels" USING btree ("teams_id");
  CREATE INDEX "_events_v_rels_teams_id_idx" ON "_events_v_rels" USING btree ("teams_id");
  ALTER TABLE "events" DROP COLUMN "hosted_by_id";
  ALTER TABLE "events_rels" DROP COLUMN "media_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_hosted_by_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "media_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_teams_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_teams_fk";
  
  DROP INDEX "events_rels_teams_id_idx";
  DROP INDEX "_events_v_rels_teams_id_idx";
  ALTER TABLE "events" ADD COLUMN "hosted_by_id" integer;
  ALTER TABLE "events" ADD COLUMN "link" varchar;
  ALTER TABLE "events_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_hosted_by_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_link" varchar;
  ALTER TABLE "_events_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "events" ADD CONSTRAINT "events_hosted_by_id_teams_id_fk" FOREIGN KEY ("hosted_by_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hosted_by_id_teams_id_fk" FOREIGN KEY ("version_hosted_by_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_hosted_by_idx" ON "events" USING btree ("hosted_by_id");
  CREATE INDEX "events_rels_media_id_idx" ON "events_rels" USING btree ("media_id");
  CREATE INDEX "_events_v_version_version_hosted_by_idx" ON "_events_v" USING btree ("version_hosted_by_id");
  CREATE INDEX "_events_v_rels_media_id_idx" ON "_events_v_rels" USING btree ("media_id");
  ALTER TABLE "events" DROP COLUMN "signup_link";
  ALTER TABLE "events" DROP COLUMN "media_link";
  ALTER TABLE "events_rels" DROP COLUMN "teams_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_signup_link";
  ALTER TABLE "_events_v" DROP COLUMN "version_media_link";
  ALTER TABLE "_events_v_rels" DROP COLUMN "teams_id";`)
}
