import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "hero_image_position_desktop_x" numeric DEFAULT 50;
  ALTER TABLE "pages" ADD COLUMN "hero_image_position_desktop_y" numeric DEFAULT 50;
  ALTER TABLE "pages" ADD COLUMN "hero_image_position_desktop_zoom" numeric DEFAULT 100;
  ALTER TABLE "pages" ADD COLUMN "hero_image_position_mobile_x" numeric DEFAULT 50;
  ALTER TABLE "pages" ADD COLUMN "hero_image_position_mobile_y" numeric DEFAULT 50;
  ALTER TABLE "pages" ADD COLUMN "hero_image_position_mobile_zoom" numeric DEFAULT 100;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_position_desktop_x" numeric DEFAULT 50;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_position_desktop_y" numeric DEFAULT 50;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_position_desktop_zoom" numeric DEFAULT 100;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_position_mobile_x" numeric DEFAULT 50;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_position_mobile_y" numeric DEFAULT 50;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_image_position_mobile_zoom" numeric DEFAULT 100;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "hero_image_position_desktop_x";
  ALTER TABLE "pages" DROP COLUMN "hero_image_position_desktop_y";
  ALTER TABLE "pages" DROP COLUMN "hero_image_position_desktop_zoom";
  ALTER TABLE "pages" DROP COLUMN "hero_image_position_mobile_x";
  ALTER TABLE "pages" DROP COLUMN "hero_image_position_mobile_y";
  ALTER TABLE "pages" DROP COLUMN "hero_image_position_mobile_zoom";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_position_desktop_x";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_position_desktop_y";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_position_desktop_zoom";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_position_mobile_x";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_position_mobile_y";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_image_position_mobile_zoom";`)
}
