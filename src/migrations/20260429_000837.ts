import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_committee_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"committee_id" integer,
  	"team_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_committee_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"committee_id" integer,
  	"team_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_committee_team_members" ADD CONSTRAINT "pages_blocks_committee_team_members_committee_id_committee_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committee"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_committee_team_members" ADD CONSTRAINT "pages_blocks_committee_team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_committee_team_members" ADD CONSTRAINT "pages_blocks_committee_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_committee_team_members" ADD CONSTRAINT "_pages_v_blocks_committee_team_members_committee_id_committee_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committee"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_committee_team_members" ADD CONSTRAINT "_pages_v_blocks_committee_team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_committee_team_members" ADD CONSTRAINT "_pages_v_blocks_committee_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_committee_team_members_order_idx" ON "pages_blocks_committee_team_members" USING btree ("_order");
  CREATE INDEX "pages_blocks_committee_team_members_parent_id_idx" ON "pages_blocks_committee_team_members" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_committee_team_members_path_idx" ON "pages_blocks_committee_team_members" USING btree ("_path");
  CREATE INDEX "pages_blocks_committee_team_members_locale_idx" ON "pages_blocks_committee_team_members" USING btree ("_locale");
  CREATE INDEX "pages_blocks_committee_team_members_committee_idx" ON "pages_blocks_committee_team_members" USING btree ("committee_id");
  CREATE INDEX "pages_blocks_committee_team_members_team_idx" ON "pages_blocks_committee_team_members" USING btree ("team_id");
  CREATE INDEX "_pages_v_blocks_committee_team_members_order_idx" ON "_pages_v_blocks_committee_team_members" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_committee_team_members_parent_id_idx" ON "_pages_v_blocks_committee_team_members" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_committee_team_members_path_idx" ON "_pages_v_blocks_committee_team_members" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_committee_team_members_locale_idx" ON "_pages_v_blocks_committee_team_members" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_committee_team_members_committee_idx" ON "_pages_v_blocks_committee_team_members" USING btree ("committee_id");
  CREATE INDEX "_pages_v_blocks_committee_team_members_team_idx" ON "_pages_v_blocks_committee_team_members" USING btree ("team_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_committee_team_members" CASCADE;
  DROP TABLE "_pages_v_blocks_committee_team_members" CASCADE;`)
}
