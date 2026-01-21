import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_execs_team" AS ENUM('ieee', 'mdsc', 'wie', 'cegsc');
  CREATE TYPE "public"."enum_execs_role" AS ENUM('exec', 'commish', 'coord');
  CREATE TYPE "public"."enum_execs_ieee_exec_position" AS ENUM('chair', 'cochair', 'vicechair', 'treasurer', 'mcndirector', 'secretary', 'external', 'academic', 'social', 'equity', 'merch', 'comms', 'webmaster');
  CREATE TYPE "public"."enum_execs_ieee_commissioner_position" AS ENUM('ieee-elg-commish', 'ieee-ceg-commish', 'ieee-seg-commish', 'ieee-mdsc-commish', 'ieee-comptech-commish', 'ieee-design-commish', 'ieee-translations-commish');
  CREATE TYPE "public"."enum_execs_ieee_coordinator_position" AS ENUM('ieee-first-year-coord', 'ieee-media-coord', 'ieee-industry-coord', 'ieee-tech-coord', 'ieee-sw-tech-coord');
  CREATE TYPE "public"."enum_execs_wie_exec_position" AS ENUM('wie-chair', 'wie-cochair', 'wie-vicechair', 'wie-finance', 'wie-external', 'wie-internal');
  CREATE TYPE "public"."enum_execs_wie_commissioner_position" AS ENUM('wie-design-commish');
  CREATE TYPE "public"."enum_execs_mdsc_exec_position" AS ENUM('mdsc-chair', 'mdsc-cochair', 'mdsc-vicechair', 'mdsc-events', 'mdsc-comms');
  CREATE TYPE "public"."enum_execs_mdsc_commissioner_position" AS ENUM('mdsc-pm', 'mdsc-epp', 'mdsc-swd', 'mdsc-sustain', 'mdsc-first-year-rep');
  CREATE TYPE "public"."enum_execs_cegsc_exec_position" AS ENUM('cegsc-chair', 'cegsc-cochair', 'cegsc-vicechair', 'cegsc-events', 'cegsc-comms');
  CREATE TABLE "execs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"team" "enum_execs_team",
  	"role" "enum_execs_role",
  	"ieee_exec_position" "enum_execs_ieee_exec_position",
  	"ieee_commissioner_position" "enum_execs_ieee_commissioner_position",
  	"ieee_coordinator_position" "enum_execs_ieee_coordinator_position",
  	"wie_exec_position" "enum_execs_wie_exec_position",
  	"wie_commissioner_position" "enum_execs_wie_commissioner_position",
  	"mdsc_exec_position" "enum_execs_mdsc_exec_position",
  	"mdsc_commissioner_position" "enum_execs_mdsc_commissioner_position",
  	"cegsc_exec_position" "enum_execs_cegsc_exec_position",
  	"headshot_id" integer,
  	"contact_email" varchar,
  	"linkedin_profile" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "execs_id" integer;
  ALTER TABLE "execs" ADD CONSTRAINT "execs_headshot_id_media_id_fk" FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "execs_headshot_idx" ON "execs" USING btree ("headshot_id");
  CREATE INDEX "execs_updated_at_idx" ON "execs" USING btree ("updated_at");
  CREATE INDEX "execs_created_at_idx" ON "execs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_execs_fk" FOREIGN KEY ("execs_id") REFERENCES "public"."execs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_execs_id_idx" ON "payload_locked_documents_rels" USING btree ("execs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "execs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "execs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_execs_fk";
  
  DROP INDEX "payload_locked_documents_rels_execs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "execs_id";
  DROP TYPE "public"."enum_execs_team";
  DROP TYPE "public"."enum_execs_role";
  DROP TYPE "public"."enum_execs_ieee_exec_position";
  DROP TYPE "public"."enum_execs_ieee_commissioner_position";
  DROP TYPE "public"."enum_execs_ieee_coordinator_position";
  DROP TYPE "public"."enum_execs_wie_exec_position";
  DROP TYPE "public"."enum_execs_wie_commissioner_position";
  DROP TYPE "public"."enum_execs_mdsc_exec_position";
  DROP TYPE "public"."enum_execs_mdsc_commissioner_position";
  DROP TYPE "public"."enum_execs_cegsc_exec_position";`)
}
