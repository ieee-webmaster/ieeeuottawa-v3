import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_nav_items_manual_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_kind" AS ENUM('link', 'dropdown');
  CREATE TYPE "public"."enum_header_nav_items_dropdown_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_header_nav_items_collection" AS ENUM('pages', 'posts', 'events', 'people', 'teams', 'committee', 'docs', 'categories');
  CREATE TYPE "public"."enum_header_nav_items_order" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_footer_nav_items_manual_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_kind" AS ENUM('link', 'dropdown');
  CREATE TYPE "public"."enum_footer_nav_items_dropdown_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_footer_nav_items_collection" AS ENUM('pages', 'posts', 'events', 'people', 'teams', 'committee', 'docs', 'categories');
  CREATE TYPE "public"."enum_footer_nav_items_order" AS ENUM('asc', 'desc');
  CREATE TABLE "header_nav_items_manual_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_manual_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "header_nav_items_manual_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_nav_items_manual_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_manual_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "footer_nav_items_manual_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "header_nav_items_locales" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_nav_items_locales" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "header_nav_items" ADD COLUMN "kind" "enum_header_nav_items_kind" DEFAULT 'link';
  ALTER TABLE "header_nav_items" ADD COLUMN "dropdown_mode" "enum_header_nav_items_dropdown_mode" DEFAULT 'manual';
  ALTER TABLE "header_nav_items" ADD COLUMN "collection" "enum_header_nav_items_collection";
  ALTER TABLE "header_nav_items" ADD COLUMN "field" varchar;
  ALTER TABLE "header_nav_items" ADD COLUMN "order" "enum_header_nav_items_order" DEFAULT 'asc';
  ALTER TABLE "header_nav_items" ADD COLUMN "base_url" varchar;
  ALTER TABLE "header_nav_items" ADD COLUMN "specific_url" varchar;
  ALTER TABLE "header_nav_items" ADD COLUMN "include_all" boolean DEFAULT false;
  ALTER TABLE "header_nav_items_locales" ADD COLUMN "dropdown_label" varchar;
  ALTER TABLE "header_nav_items_locales" ADD COLUMN "all_label" varchar DEFAULT 'All';
  ALTER TABLE "footer_nav_items" ADD COLUMN "kind" "enum_footer_nav_items_kind" DEFAULT 'link';
  ALTER TABLE "footer_nav_items" ADD COLUMN "dropdown_mode" "enum_footer_nav_items_dropdown_mode" DEFAULT 'manual';
  ALTER TABLE "footer_nav_items" ADD COLUMN "collection" "enum_footer_nav_items_collection";
  ALTER TABLE "footer_nav_items" ADD COLUMN "field" varchar;
  ALTER TABLE "footer_nav_items" ADD COLUMN "order" "enum_footer_nav_items_order" DEFAULT 'asc';
  ALTER TABLE "footer_nav_items" ADD COLUMN "base_url" varchar;
  ALTER TABLE "footer_nav_items" ADD COLUMN "specific_url" varchar;
  ALTER TABLE "footer_nav_items" ADD COLUMN "include_all" boolean DEFAULT false;
  ALTER TABLE "footer_nav_items_locales" ADD COLUMN "dropdown_label" varchar;
  ALTER TABLE "footer_nav_items_locales" ADD COLUMN "all_label" varchar DEFAULT 'All';
  ALTER TABLE "header_nav_items_manual_items" ADD CONSTRAINT "header_nav_items_manual_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_manual_items_locales" ADD CONSTRAINT "header_nav_items_manual_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items_manual_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items_manual_items" ADD CONSTRAINT "footer_nav_items_manual_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items_manual_items_locales" ADD CONSTRAINT "footer_nav_items_manual_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_nav_items_manual_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_items_manual_items_order_idx" ON "header_nav_items_manual_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_manual_items_parent_id_idx" ON "header_nav_items_manual_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_nav_items_manual_items_locales_locale_parent_id_uniqu" ON "header_nav_items_manual_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_nav_items_manual_items_order_idx" ON "footer_nav_items_manual_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_manual_items_parent_id_idx" ON "footer_nav_items_manual_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_nav_items_manual_items_locales_locale_parent_id_uniqu" ON "footer_nav_items_manual_items_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items_manual_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items_manual_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items_manual_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items_manual_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "header_nav_items_manual_items" CASCADE;
  DROP TABLE "header_nav_items_manual_items_locales" CASCADE;
  DROP TABLE "footer_nav_items_manual_items" CASCADE;
  DROP TABLE "footer_nav_items_manual_items_locales" CASCADE;
  ALTER TABLE "header_nav_items_locales" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_nav_items_locales" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "header_nav_items" DROP COLUMN "kind";
  ALTER TABLE "header_nav_items" DROP COLUMN "dropdown_mode";
  ALTER TABLE "header_nav_items" DROP COLUMN "collection";
  ALTER TABLE "header_nav_items" DROP COLUMN "field";
  ALTER TABLE "header_nav_items" DROP COLUMN "order";
  ALTER TABLE "header_nav_items" DROP COLUMN "base_url";
  ALTER TABLE "header_nav_items" DROP COLUMN "specific_url";
  ALTER TABLE "header_nav_items" DROP COLUMN "include_all";
  ALTER TABLE "header_nav_items_locales" DROP COLUMN "dropdown_label";
  ALTER TABLE "header_nav_items_locales" DROP COLUMN "all_label";
  ALTER TABLE "footer_nav_items" DROP COLUMN "kind";
  ALTER TABLE "footer_nav_items" DROP COLUMN "dropdown_mode";
  ALTER TABLE "footer_nav_items" DROP COLUMN "collection";
  ALTER TABLE "footer_nav_items" DROP COLUMN "field";
  ALTER TABLE "footer_nav_items" DROP COLUMN "order";
  ALTER TABLE "footer_nav_items" DROP COLUMN "base_url";
  ALTER TABLE "footer_nav_items" DROP COLUMN "specific_url";
  ALTER TABLE "footer_nav_items" DROP COLUMN "include_all";
  ALTER TABLE "footer_nav_items_locales" DROP COLUMN "dropdown_label";
  ALTER TABLE "footer_nav_items_locales" DROP COLUMN "all_label";
  DROP TYPE "public"."enum_header_nav_items_manual_items_link_type";
  DROP TYPE "public"."enum_header_nav_items_kind";
  DROP TYPE "public"."enum_header_nav_items_dropdown_mode";
  DROP TYPE "public"."enum_header_nav_items_collection";
  DROP TYPE "public"."enum_header_nav_items_order";
  DROP TYPE "public"."enum_footer_nav_items_manual_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_kind";
  DROP TYPE "public"."enum_footer_nav_items_dropdown_mode";
  DROP TYPE "public"."enum_footer_nav_items_collection";
  DROP TYPE "public"."enum_footer_nav_items_order";`)
}
