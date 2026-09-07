import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "hero_show_circuits" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_show_circuits" boolean DEFAULT true;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "hero_show_circuits";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_show_circuits";`)
}
