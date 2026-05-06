import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_roles_collection_permissions_actions" AS ENUM('create', 'update', 'delete');
  CREATE TYPE "public"."enum_roles_collection_permissions_collection" AS ENUM('pages', 'posts', 'media', 'categories', 'events', 'people', 'teams', 'committee', 'docs', 'socialLinks', 'redirects', 'forms', 'form-submissions', 'users', 'header', 'footer');
  CREATE TYPE "public"."enum_roles_tag_permissions_actions" AS ENUM('create', 'update', 'delete');
  CREATE TYPE "public"."enum_roles_tag_permissions_effect" AS ENUM('allow', 'deny');
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer
  );
  
  CREATE TABLE "people_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "teams_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "committee_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "docs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "social_links_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_tags_id" integer
  );
  
  CREATE TABLE "roles_collection_permissions_actions" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_roles_collection_permissions_actions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "roles_collection_permissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"collection" "enum_roles_collection_permissions_collection" NOT NULL
  );
  
  CREATE TABLE "roles_tag_permissions_actions" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_roles_tag_permissions_actions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "roles_tag_permissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag_id" integer NOT NULL,
  	"effect" "enum_roles_tag_permissions_effect" DEFAULT 'allow' NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "access_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "access_tags_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "users" ADD COLUMN "super_admin" boolean DEFAULT false;
  ALTER TABLE "events_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "access_tags_id" integer;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams_rels" ADD CONSTRAINT "teams_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams_rels" ADD CONSTRAINT "teams_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_rels" ADD CONSTRAINT "committee_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_rels" ADD CONSTRAINT "committee_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_rels" ADD CONSTRAINT "docs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "docs_rels" ADD CONSTRAINT "docs_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_links_rels" ADD CONSTRAINT "social_links_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_links_rels" ADD CONSTRAINT "social_links_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_collection_permissions_actions" ADD CONSTRAINT "roles_collection_permissions_actions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles_collection_permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_collection_permissions" ADD CONSTRAINT "roles_collection_permissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_tag_permissions_actions" ADD CONSTRAINT "roles_tag_permissions_actions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles_tag_permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_tag_permissions" ADD CONSTRAINT "roles_tag_permissions_tag_id_access_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."access_tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "roles_tag_permissions" ADD CONSTRAINT "roles_tag_permissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "access_tags_locales" ADD CONSTRAINT "access_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_access_tags_id_idx" ON "media_rels" USING btree ("access_tags_id");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_access_tags_id_idx" ON "categories_rels" USING btree ("access_tags_id");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_roles_id_idx" ON "users_rels" USING btree ("roles_id");
  CREATE INDEX "people_rels_order_idx" ON "people_rels" USING btree ("order");
  CREATE INDEX "people_rels_parent_idx" ON "people_rels" USING btree ("parent_id");
  CREATE INDEX "people_rels_path_idx" ON "people_rels" USING btree ("path");
  CREATE INDEX "people_rels_access_tags_id_idx" ON "people_rels" USING btree ("access_tags_id");
  CREATE INDEX "teams_rels_order_idx" ON "teams_rels" USING btree ("order");
  CREATE INDEX "teams_rels_parent_idx" ON "teams_rels" USING btree ("parent_id");
  CREATE INDEX "teams_rels_path_idx" ON "teams_rels" USING btree ("path");
  CREATE INDEX "teams_rels_access_tags_id_idx" ON "teams_rels" USING btree ("access_tags_id");
  CREATE INDEX "committee_rels_order_idx" ON "committee_rels" USING btree ("order");
  CREATE INDEX "committee_rels_parent_idx" ON "committee_rels" USING btree ("parent_id");
  CREATE INDEX "committee_rels_path_idx" ON "committee_rels" USING btree ("path");
  CREATE INDEX "committee_rels_access_tags_id_idx" ON "committee_rels" USING btree ("access_tags_id");
  CREATE INDEX "docs_rels_order_idx" ON "docs_rels" USING btree ("order");
  CREATE INDEX "docs_rels_parent_idx" ON "docs_rels" USING btree ("parent_id");
  CREATE INDEX "docs_rels_path_idx" ON "docs_rels" USING btree ("path");
  CREATE INDEX "docs_rels_access_tags_id_idx" ON "docs_rels" USING btree ("access_tags_id");
  CREATE INDEX "social_links_rels_order_idx" ON "social_links_rels" USING btree ("order");
  CREATE INDEX "social_links_rels_parent_idx" ON "social_links_rels" USING btree ("parent_id");
  CREATE INDEX "social_links_rels_path_idx" ON "social_links_rels" USING btree ("path");
  CREATE INDEX "social_links_rels_access_tags_id_idx" ON "social_links_rels" USING btree ("access_tags_id");
  CREATE INDEX "roles_collection_permissions_actions_order_idx" ON "roles_collection_permissions_actions" USING btree ("order");
  CREATE INDEX "roles_collection_permissions_actions_parent_idx" ON "roles_collection_permissions_actions" USING btree ("parent_id");
  CREATE INDEX "roles_collection_permissions_order_idx" ON "roles_collection_permissions" USING btree ("_order");
  CREATE INDEX "roles_collection_permissions_parent_id_idx" ON "roles_collection_permissions" USING btree ("_parent_id");
  CREATE INDEX "roles_tag_permissions_actions_order_idx" ON "roles_tag_permissions_actions" USING btree ("order");
  CREATE INDEX "roles_tag_permissions_actions_parent_idx" ON "roles_tag_permissions_actions" USING btree ("parent_id");
  CREATE INDEX "roles_tag_permissions_order_idx" ON "roles_tag_permissions" USING btree ("_order");
  CREATE INDEX "roles_tag_permissions_parent_id_idx" ON "roles_tag_permissions" USING btree ("_parent_id");
  CREATE INDEX "roles_tag_permissions_tag_idx" ON "roles_tag_permissions" USING btree ("tag_id");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE UNIQUE INDEX "access_tags_slug_idx" ON "access_tags" USING btree ("slug");
  CREATE INDEX "access_tags_updated_at_idx" ON "access_tags" USING btree ("updated_at");
  CREATE INDEX "access_tags_created_at_idx" ON "access_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "access_tags_name_idx" ON "access_tags_locales" USING btree ("name","_locale");
  CREATE UNIQUE INDEX "access_tags_locales_locale_parent_id_unique" ON "access_tags_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_access_tags_fk" FOREIGN KEY ("access_tags_id") REFERENCES "public"."access_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_access_tags_id_idx" ON "pages_rels" USING btree ("access_tags_id","locale");
  CREATE INDEX "_pages_v_rels_access_tags_id_idx" ON "_pages_v_rels" USING btree ("access_tags_id","locale");
  CREATE INDEX "posts_rels_access_tags_id_idx" ON "posts_rels" USING btree ("access_tags_id");
  CREATE INDEX "_posts_v_rels_access_tags_id_idx" ON "_posts_v_rels" USING btree ("access_tags_id");
  CREATE INDEX "events_rels_access_tags_id_idx" ON "events_rels" USING btree ("access_tags_id");
  CREATE INDEX "_events_v_rels_access_tags_id_idx" ON "_events_v_rels" USING btree ("access_tags_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_access_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("access_tags_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "teams_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "docs_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_links_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_collection_permissions_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_collection_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_tag_permissions_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_tag_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "access_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "access_tags_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "people_rels" CASCADE;
  DROP TABLE "teams_rels" CASCADE;
  DROP TABLE "committee_rels" CASCADE;
  DROP TABLE "docs_rels" CASCADE;
  DROP TABLE "social_links_rels" CASCADE;
  DROP TABLE "roles_collection_permissions_actions" CASCADE;
  DROP TABLE "roles_collection_permissions" CASCADE;
  DROP TABLE "roles_tag_permissions_actions" CASCADE;
  DROP TABLE "roles_tag_permissions" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "access_tags" CASCADE;
  DROP TABLE "access_tags_locales" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_access_tags_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_access_tags_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_access_tags_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_access_tags_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_access_tags_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_access_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_roles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_access_tags_fk";
  
  DROP INDEX "pages_rels_access_tags_id_idx";
  DROP INDEX "_pages_v_rels_access_tags_id_idx";
  DROP INDEX "posts_rels_access_tags_id_idx";
  DROP INDEX "_posts_v_rels_access_tags_id_idx";
  DROP INDEX "events_rels_access_tags_id_idx";
  DROP INDEX "_events_v_rels_access_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_roles_id_idx";
  DROP INDEX "payload_locked_documents_rels_access_tags_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "access_tags_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "access_tags_id";
  ALTER TABLE "posts_rels" DROP COLUMN "access_tags_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "access_tags_id";
  ALTER TABLE "users" DROP COLUMN "super_admin";
  ALTER TABLE "events_rels" DROP COLUMN "access_tags_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "access_tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "roles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "access_tags_id";
  DROP TYPE "public"."enum_roles_collection_permissions_actions";
  DROP TYPE "public"."enum_roles_collection_permissions_collection";
  DROP TYPE "public"."enum_roles_tag_permissions_actions";
  DROP TYPE "public"."enum_roles_tag_permissions_effect";`)
}
