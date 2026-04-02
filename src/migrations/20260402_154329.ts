import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "committee" ADD COLUMN "cover_image_id" integer;
  ALTER TABLE "committee" ADD CONSTRAINT "committee_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "committee_cover_image_idx" ON "committee" USING btree ("cover_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "committee" DROP CONSTRAINT "committee_cover_image_id_media_id_fk";
  
  DROP INDEX "committee_cover_image_idx";
  ALTER TABLE "committee" DROP COLUMN "cover_image_id";`)
}
