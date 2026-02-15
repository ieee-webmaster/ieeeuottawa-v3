import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_events_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
  );

  INSERT INTO "events_rels" ("order", "parent_id", "path", "media_id")
  SELECT 1, "id", 'Media', "media_id"
  FROM "events"
  WHERE "media_id" IS NOT NULL;

  INSERT INTO "_events_v_rels" ("order", "parent_id", "path", "media_id")
  SELECT 1, "id", 'Media', "version_media_id"
  FROM "_events_v"
  WHERE "version_media_id" IS NOT NULL;
  
  ALTER TABLE "events" DROP CONSTRAINT "events_media_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_media_id_media_id_fk";
  
  DROP INDEX "events_media_idx";
  DROP INDEX "_events_v_version_version_media_idx";
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_media_id_idx" ON "events_rels" USING btree ("media_id");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_media_id_idx" ON "_events_v_rels" USING btree ("media_id");
  ALTER TABLE "events" DROP COLUMN "media_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_media_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  ALTER TABLE "events" ADD COLUMN "media_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_media_id" integer;
  ALTER TABLE "events" ADD CONSTRAINT "events_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_media_id_media_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_media_idx" ON "events" USING btree ("media_id");
  CREATE INDEX "_events_v_version_version_media_idx" ON "_events_v" USING btree ("version_media_id");`)

  await db.execute(sql`
  UPDATE "events" e
  SET "media_id" = rel."media_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "media_id"
    FROM "events_rels"
    WHERE "path" = 'Media' AND "media_id" IS NOT NULL
    ORDER BY "parent_id", COALESCE("order", 0) ASC, "id" ASC
  ) rel
  WHERE e."id" = rel."parent_id";

  UPDATE "_events_v" e
  SET "version_media_id" = rel."media_id"
  FROM (
    SELECT DISTINCT ON ("parent_id") "parent_id", "media_id"
    FROM "_events_v_rels"
    WHERE "path" = 'Media' AND "media_id" IS NOT NULL
    ORDER BY "parent_id", COALESCE("order", 0) ASC, "id" ASC
  ) rel
  WHERE e."id" = rel."parent_id";`)
}
