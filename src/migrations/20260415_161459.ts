import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "social_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"light_icon_id" integer NOT NULL,
  	"dark_icon_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_locales" (
  	"contact_phone" varchar,
  	"contact_location" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "social_links_id" integer;
  ALTER TABLE "header" ADD COLUMN "show_social_link_labels" boolean DEFAULT false;
  ALTER TABLE "header_rels" ADD COLUMN "social_links_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "social_links_id" integer;
  ALTER TABLE "social_links" ADD CONSTRAINT "social_links_light_icon_id_media_id_fk" FOREIGN KEY ("light_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_links" ADD CONSTRAINT "social_links_dark_icon_id_media_id_fk" FOREIGN KEY ("dark_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "social_links_light_icon_idx" ON "social_links" USING btree ("light_icon_id");
  CREATE INDEX "social_links_dark_icon_idx" ON "social_links" USING btree ("dark_icon_id");
  CREATE INDEX "social_links_updated_at_idx" ON "social_links" USING btree ("updated_at");
  CREATE INDEX "social_links_created_at_idx" ON "social_links" USING btree ("created_at");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_links_fk" FOREIGN KEY ("social_links_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_social_links_fk" FOREIGN KEY ("social_links_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_social_links_fk" FOREIGN KEY ("social_links_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_social_links_id_idx" ON "payload_locked_documents_rels" USING btree ("social_links_id");
  CREATE INDEX "header_rels_social_links_id_idx" ON "header_rels" USING btree ("social_links_id");
  CREATE INDEX "footer_rels_social_links_id_idx" ON "footer_rels" USING btree ("social_links_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "social_links" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_social_links_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_social_links_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_social_links_fk";
  
  DROP INDEX "payload_locked_documents_rels_social_links_id_idx";
  DROP INDEX "header_rels_social_links_id_idx";
  DROP INDEX "footer_rels_social_links_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "social_links_id";
  ALTER TABLE "header" DROP COLUMN "show_social_link_labels";
  ALTER TABLE "header_rels" DROP COLUMN "social_links_id";
  ALTER TABLE "footer_rels" DROP COLUMN "social_links_id";`)
}
