import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" RENAME COLUMN "signup_link" TO "link";
  ALTER TABLE "_events_v" RENAME COLUMN "version_signup_link" TO "version_link";
  ALTER TABLE "events" ADD COLUMN "hosted_by_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_hosted_by_id" integer;
  ALTER TABLE "events" ADD CONSTRAINT "events_hosted_by_id_teams_id_fk" FOREIGN KEY ("hosted_by_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hosted_by_id_teams_id_fk" FOREIGN KEY ("version_hosted_by_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_hosted_by_idx" ON "events" USING btree ("hosted_by_id");
  CREATE INDEX "_events_v_version_version_hosted_by_idx" ON "_events_v" USING btree ("version_hosted_by_id");
  ALTER TABLE "events" DROP COLUMN "hosted_by";
  ALTER TABLE "_events_v" DROP COLUMN "version_hosted_by";
  DROP TYPE "public"."enum_events_hosted_by";
  DROP TYPE "public"."enum__events_v_version_hosted_by";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_hosted_by" AS ENUM('ieee', 'other');
  CREATE TYPE "public"."enum__events_v_version_hosted_by" AS ENUM('ieee', 'other');
  ALTER TABLE "events" RENAME COLUMN "link" TO "signup_link";
  ALTER TABLE "_events_v" RENAME COLUMN "version_link" TO "version_signup_link";
  ALTER TABLE "events" DROP CONSTRAINT "events_hosted_by_id_teams_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_hosted_by_id_teams_id_fk";
  
  DROP INDEX "events_hosted_by_idx";
  DROP INDEX "_events_v_version_version_hosted_by_idx";
  ALTER TABLE "events" ADD COLUMN "hosted_by" "enum_events_hosted_by";
  ALTER TABLE "_events_v" ADD COLUMN "version_hosted_by" "enum__events_v_version_hosted_by";
  ALTER TABLE "events" DROP COLUMN "hosted_by_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_hosted_by_id";`)
}
