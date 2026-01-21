import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_committee_ieee_positions_role" AS ENUM('exec', 'commish', 'coord');
  CREATE TYPE "public"."enum_committee_ieee_positions_position_title" AS ENUM('chair', 'cochair', 'vicechair', 'treasurer', 'mcndirector', 'secretary', 'external', 'academic', 'social', 'equity', 'merch', 'comms', 'webmaster');
  CREATE TYPE "public"."enum_committee_ieee_positions_commissioner_title" AS ENUM('ieee-elg-commish', 'ieee-ceg-commish', 'ieee-seg-commish', 'ieee-mdsc-commish', 'ieee-comptech-commish', 'ieee-design-commish', 'ieee-translations-commish');
  CREATE TYPE "public"."enum_committee_ieee_positions_coordinator_title" AS ENUM('ieee-first-year-coord', 'ieee-media-coord', 'ieee-industry-coord', 'ieee-tech-coord', 'ieee-sw-tech-coord');
  CREATE TYPE "public"."enum_committee_mdsc_positions_role" AS ENUM('exec', 'commish', 'coord');
  CREATE TYPE "public"."enum_committee_mdsc_positions_position_title" AS ENUM('mdsc-chair', 'mdsc-cochair', 'mdsc-vicechair', 'mdsc-events', 'mdsc-comms');
  CREATE TYPE "public"."enum_committee_mdsc_positions_commissioner_title" AS ENUM('mdsc-pm', 'mdsc-epp', 'mdsc-swd', 'mdsc-sustain', 'mdsc-first-year-rep');
  CREATE TYPE "public"."enum_committee_wie_positions_role" AS ENUM('exec', 'commish', 'coord');
  CREATE TYPE "public"."enum_committee_wie_positions_position_title" AS ENUM('wie-chair', 'wie-cochair', 'wie-vicechair', 'wie-finance', 'wie-external', 'wie-internal');
  CREATE TYPE "public"."enum_committee_wie_positions_commissioner_title" AS ENUM('wie-design-commish');
  CREATE TYPE "public"."enum_committee_cegsc_positions_role" AS ENUM('exec', 'commish', 'coord');
  CREATE TYPE "public"."enum_committee_cegsc_positions_position_title" AS ENUM('cegsc-chair', 'cegsc-cochair', 'cegsc-vicechair', 'cegsc-events', 'cegsc-comms');
  ALTER TYPE "public"."enum_payload_folders_folder_type" ADD VALUE 'events';
  ALTER TYPE "public"."enum_payload_folders_folder_type" ADD VALUE 'people';
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"location" varchar,
  	"hosted_by" varchar,
  	"signup_link" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_location" varchar,
  	"version_hosted_by" varchar,
  	"version_signup_link" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_folder_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"headshot_id" integer,
  	"contact_email" varchar,
  	"linkedin_profile" varchar,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "committee_ieee_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" "enum_committee_ieee_positions_role" NOT NULL,
  	"position_title" "enum_committee_ieee_positions_position_title",
  	"commissioner_title" "enum_committee_ieee_positions_commissioner_title",
  	"coordinator_title" "enum_committee_ieee_positions_coordinator_title"
  );
  
  CREATE TABLE "committee_mdsc_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" "enum_committee_mdsc_positions_role" NOT NULL,
  	"position_title" "enum_committee_mdsc_positions_position_title",
  	"commissioner_title" "enum_committee_mdsc_positions_commissioner_title"
  );
  
  CREATE TABLE "committee_wie_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" "enum_committee_wie_positions_role" NOT NULL,
  	"position_title" "enum_committee_wie_positions_position_title",
  	"commissioner_title" "enum_committee_wie_positions_commissioner_title"
  );
  
  CREATE TABLE "committee_cegsc_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" "enum_committee_cegsc_positions_role" NOT NULL,
  	"position_title" "enum_committee_cegsc_positions_position_title"
  );
  
  CREATE TABLE "committee" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "committee_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"people_id" integer
  );
  
  CREATE TABLE "docs_general_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"google_docs_url" varchar NOT NULL
  );
  
  CREATE TABLE "docs_meeting_minutes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"meeting_date" timestamp(3) with time zone,
  	"description" varchar,
  	"google_docs_url" varchar NOT NULL
  );
  
  CREATE TABLE "docs_other_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"google_docs_url" varchar NOT NULL
  );
  
  CREATE TABLE "docs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "committee_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "docs_id" integer;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_folder_id_payload_folders_id_fk" FOREIGN KEY ("version_folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_headshot_id_media_id_fk" FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "committee_ieee_positions" ADD CONSTRAINT "committee_ieee_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_mdsc_positions" ADD CONSTRAINT "committee_mdsc_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_wie_positions" ADD CONSTRAINT "committee_wie_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_cegsc_positions" ADD CONSTRAINT "committee_cegsc_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_rels" ADD CONSTRAINT "committee_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_rels" ADD CONSTRAINT "committee_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_general_documents" ADD CONSTRAINT "docs_general_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_meeting_minutes" ADD CONSTRAINT "docs_meeting_minutes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_other_documents" ADD CONSTRAINT "docs_other_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_folder_idx" ON "events" USING btree ("folder_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_folder_idx" ON "_events_v" USING btree ("version_folder_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "people_headshot_idx" ON "people" USING btree ("headshot_id");
  CREATE INDEX "people_folder_idx" ON "people" USING btree ("folder_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "committee_ieee_positions_order_idx" ON "committee_ieee_positions" USING btree ("_order");
  CREATE INDEX "committee_ieee_positions_parent_id_idx" ON "committee_ieee_positions" USING btree ("_parent_id");
  CREATE INDEX "committee_mdsc_positions_order_idx" ON "committee_mdsc_positions" USING btree ("_order");
  CREATE INDEX "committee_mdsc_positions_parent_id_idx" ON "committee_mdsc_positions" USING btree ("_parent_id");
  CREATE INDEX "committee_wie_positions_order_idx" ON "committee_wie_positions" USING btree ("_order");
  CREATE INDEX "committee_wie_positions_parent_id_idx" ON "committee_wie_positions" USING btree ("_parent_id");
  CREATE INDEX "committee_cegsc_positions_order_idx" ON "committee_cegsc_positions" USING btree ("_order");
  CREATE INDEX "committee_cegsc_positions_parent_id_idx" ON "committee_cegsc_positions" USING btree ("_parent_id");
  CREATE INDEX "committee_updated_at_idx" ON "committee" USING btree ("updated_at");
  CREATE INDEX "committee_created_at_idx" ON "committee" USING btree ("created_at");
  CREATE INDEX "committee_rels_order_idx" ON "committee_rels" USING btree ("order");
  CREATE INDEX "committee_rels_parent_idx" ON "committee_rels" USING btree ("parent_id");
  CREATE INDEX "committee_rels_path_idx" ON "committee_rels" USING btree ("path");
  CREATE INDEX "committee_rels_people_id_idx" ON "committee_rels" USING btree ("people_id");
  CREATE INDEX "docs_general_documents_order_idx" ON "docs_general_documents" USING btree ("_order");
  CREATE INDEX "docs_general_documents_parent_id_idx" ON "docs_general_documents" USING btree ("_parent_id");
  CREATE INDEX "docs_meeting_minutes_order_idx" ON "docs_meeting_minutes" USING btree ("_order");
  CREATE INDEX "docs_meeting_minutes_parent_id_idx" ON "docs_meeting_minutes" USING btree ("_parent_id");
  CREATE INDEX "docs_other_documents_order_idx" ON "docs_other_documents" USING btree ("_order");
  CREATE INDEX "docs_other_documents_parent_id_idx" ON "docs_other_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "docs_year_idx" ON "docs" USING btree ("year");
  CREATE INDEX "docs_updated_at_idx" ON "docs" USING btree ("updated_at");
  CREATE INDEX "docs_created_at_idx" ON "docs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_committee_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_docs_fk" FOREIGN KEY ("docs_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_committee_id_idx" ON "payload_locked_documents_rels" USING btree ("committee_id");
  CREATE INDEX "payload_locked_documents_rels_docs_id_idx" ON "payload_locked_documents_rels" USING btree ("docs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_ieee_positions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_mdsc_positions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_wie_positions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_cegsc_positions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs_general_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs_meeting_minutes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs_other_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "events" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "committee_ieee_positions" CASCADE;
  DROP TABLE "committee_mdsc_positions" CASCADE;
  DROP TABLE "committee_wie_positions" CASCADE;
  DROP TABLE "committee_cegsc_positions" CASCADE;
  DROP TABLE "committee" CASCADE;
  DROP TABLE "committee_rels" CASCADE;
  DROP TABLE "docs_general_documents" CASCADE;
  DROP TABLE "docs_meeting_minutes" CASCADE;
  DROP TABLE "docs_other_documents" CASCADE;
  DROP TABLE "docs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_people_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_committee_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_docs_fk";
  
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_folders_folder_type";
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE "public"."enum_payload_folders_folder_type" USING "value"::"public"."enum_payload_folders_folder_type";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_people_id_idx";
  DROP INDEX "payload_locked_documents_rels_committee_id_idx";
  DROP INDEX "payload_locked_documents_rels_docs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "people_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "committee_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "docs_id";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_committee_ieee_positions_role";
  DROP TYPE "public"."enum_committee_ieee_positions_position_title";
  DROP TYPE "public"."enum_committee_ieee_positions_commissioner_title";
  DROP TYPE "public"."enum_committee_ieee_positions_coordinator_title";
  DROP TYPE "public"."enum_committee_mdsc_positions_role";
  DROP TYPE "public"."enum_committee_mdsc_positions_position_title";
  DROP TYPE "public"."enum_committee_mdsc_positions_commissioner_title";
  DROP TYPE "public"."enum_committee_wie_positions_role";
  DROP TYPE "public"."enum_committee_wie_positions_position_title";
  DROP TYPE "public"."enum_committee_wie_positions_commissioner_title";
  DROP TYPE "public"."enum_committee_cegsc_positions_role";
  DROP TYPE "public"."enum_committee_cegsc_positions_position_title";`)
}
