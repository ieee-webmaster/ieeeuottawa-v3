import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_accordion_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_banner_style" AS ENUM('info', 'warning', 'error', 'success');
  CREATE TYPE "public"."enum_pages_blocks_split_section_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_split_section_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_split_section_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_split_section_media_aspect" AS ENUM('portrait', 'square', 'landscape', 'wide');
  CREATE TYPE "public"."enum_pages_blocks_split_section_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_quick_links_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_quick_links_style" AS ENUM('cards', 'list');
  CREATE TYPE "public"."enum_pages_blocks_quick_links_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_logo_grid_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_logo_grid_style" AS ENUM('grid', 'featured');
  CREATE TYPE "public"."enum_pages_blocks_logo_grid_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_gallery_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_gallery_layout" AS ENUM('grid', 'featureMix');
  CREATE TYPE "public"."enum_pages_blocks_gallery_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_accordion_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_style" AS ENUM('info', 'warning', 'error', 'success');
  CREATE TYPE "public"."enum__pages_v_blocks_split_section_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_split_section_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_split_section_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_split_section_media_aspect" AS ENUM('portrait', 'square', 'landscape', 'wide');
  CREATE TYPE "public"."enum__pages_v_blocks_split_section_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_quick_links_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_quick_links_style" AS ENUM('cards', 'list');
  CREATE TYPE "public"."enum__pages_v_blocks_quick_links_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_grid_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_grid_style" AS ENUM('grid', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_grid_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_layout" AS ENUM('grid', 'featureMix');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_theme" AS ENUM('default', 'muted', 'accent', 'dark');
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'affinityGroup';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'affinityGroup';
  CREATE TABLE "pages_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"theme" "enum_pages_blocks_accordion_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_blocks_banner_style" DEFAULT 'info',
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_split_section_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_split_section_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_split_section_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_split_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"content" jsonb,
  	"media_id" integer,
  	"media_position" "enum_pages_blocks_split_section_media_position" DEFAULT 'right',
  	"media_aspect" "enum_pages_blocks_split_section_media_aspect" DEFAULT 'landscape',
  	"theme" "enum_pages_blocks_split_section_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_card_grid_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"columns" "enum_pages_blocks_card_grid_columns" DEFAULT '3',
  	"theme" "enum_pages_blocks_card_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quick_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"link_type" "enum_pages_blocks_quick_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"style" "enum_pages_blocks_quick_links_style" DEFAULT 'cards',
  	"theme" "enum_pages_blocks_quick_links_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_logo_grid_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"style" "enum_pages_blocks_logo_grid_style" DEFAULT 'grid',
  	"theme" "enum_pages_blocks_logo_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_band_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"alignment" "enum_pages_blocks_cta_band_alignment" DEFAULT 'left',
  	"theme" "enum_pages_blocks_cta_band_theme" DEFAULT 'accent',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_gallery_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"layout" "enum_pages_blocks_gallery_layout" DEFAULT 'grid',
  	"theme" "enum_pages_blocks_gallery_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"theme" "enum__pages_v_blocks_accordion_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_blocks_banner_style" DEFAULT 'info',
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_section_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_split_section_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_split_section_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"content" jsonb,
  	"media_id" integer,
  	"media_position" "enum__pages_v_blocks_split_section_media_position" DEFAULT 'right',
  	"media_aspect" "enum__pages_v_blocks_split_section_media_aspect" DEFAULT 'landscape',
  	"theme" "enum__pages_v_blocks_split_section_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_card_grid_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"columns" "enum__pages_v_blocks_card_grid_columns" DEFAULT '3',
  	"theme" "enum__pages_v_blocks_card_grid_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quick_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"link_type" "enum__pages_v_blocks_quick_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"style" "enum__pages_v_blocks_quick_links_style" DEFAULT 'cards',
  	"theme" "enum__pages_v_blocks_quick_links_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_logo_grid_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"style" "enum__pages_v_blocks_logo_grid_style" DEFAULT 'grid',
  	"theme" "enum__pages_v_blocks_logo_grid_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_band_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"alignment" "enum__pages_v_blocks_cta_band_alignment" DEFAULT 'left',
  	"theme" "enum__pages_v_blocks_cta_band_theme" DEFAULT 'accent',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_gallery_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"layout" "enum__pages_v_blocks_gallery_layout" DEFAULT 'grid',
  	"theme" "enum__pages_v_blocks_gallery_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages" ADD COLUMN "hero_logo_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_logo_id" integer;
  ALTER TABLE "pages_blocks_accordion_items" ADD CONSTRAINT "pages_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_accordion" ADD CONSTRAINT "pages_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_section_links" ADD CONSTRAINT "pages_blocks_split_section_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_section" ADD CONSTRAINT "pages_blocks_split_section_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_section" ADD CONSTRAINT "pages_blocks_split_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid" ADD CONSTRAINT "pages_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quick_links_links" ADD CONSTRAINT "pages_blocks_quick_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_quick_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quick_links" ADD CONSTRAINT "pages_blocks_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_grid_items" ADD CONSTRAINT "pages_blocks_logo_grid_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_grid_items" ADD CONSTRAINT "pages_blocks_logo_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_logo_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_grid" ADD CONSTRAINT "pages_blocks_logo_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_links" ADD CONSTRAINT "pages_blocks_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_accordion_items" ADD CONSTRAINT "_pages_v_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_accordion" ADD CONSTRAINT "_pages_v_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_section_links" ADD CONSTRAINT "_pages_v_blocks_split_section_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_section" ADD CONSTRAINT "_pages_v_blocks_split_section_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_section" ADD CONSTRAINT "_pages_v_blocks_split_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid" ADD CONSTRAINT "_pages_v_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quick_links_links" ADD CONSTRAINT "_pages_v_blocks_quick_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_quick_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quick_links" ADD CONSTRAINT "_pages_v_blocks_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_grid_items" ADD CONSTRAINT "_pages_v_blocks_logo_grid_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_grid_items" ADD CONSTRAINT "_pages_v_blocks_logo_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_logo_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_grid" ADD CONSTRAINT "_pages_v_blocks_logo_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band_links" ADD CONSTRAINT "_pages_v_blocks_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_accordion_items_order_idx" ON "pages_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_accordion_items_parent_id_idx" ON "pages_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_accordion_items_locale_idx" ON "pages_blocks_accordion_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_accordion_order_idx" ON "pages_blocks_accordion" USING btree ("_order");
  CREATE INDEX "pages_blocks_accordion_parent_id_idx" ON "pages_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_accordion_path_idx" ON "pages_blocks_accordion" USING btree ("_path");
  CREATE INDEX "pages_blocks_accordion_locale_idx" ON "pages_blocks_accordion" USING btree ("_locale");
  CREATE INDEX "pages_blocks_banner_order_idx" ON "pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_parent_id_idx" ON "pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_path_idx" ON "pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_locale_idx" ON "pages_blocks_banner" USING btree ("_locale");
  CREATE INDEX "pages_blocks_split_section_links_order_idx" ON "pages_blocks_split_section_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_section_links_parent_id_idx" ON "pages_blocks_split_section_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_section_links_locale_idx" ON "pages_blocks_split_section_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_split_section_order_idx" ON "pages_blocks_split_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_section_parent_id_idx" ON "pages_blocks_split_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_section_path_idx" ON "pages_blocks_split_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_split_section_locale_idx" ON "pages_blocks_split_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_split_section_media_idx" ON "pages_blocks_split_section" USING btree ("media_id");
  CREATE INDEX "pages_blocks_card_grid_cards_order_idx" ON "pages_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_parent_id_idx" ON "pages_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_locale_idx" ON "pages_blocks_card_grid_cards" USING btree ("_locale");
  CREATE INDEX "pages_blocks_card_grid_cards_media_idx" ON "pages_blocks_card_grid_cards" USING btree ("media_id");
  CREATE INDEX "pages_blocks_card_grid_order_idx" ON "pages_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_parent_id_idx" ON "pages_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_path_idx" ON "pages_blocks_card_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_card_grid_locale_idx" ON "pages_blocks_card_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_quick_links_links_order_idx" ON "pages_blocks_quick_links_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_quick_links_links_parent_id_idx" ON "pages_blocks_quick_links_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quick_links_links_locale_idx" ON "pages_blocks_quick_links_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_quick_links_order_idx" ON "pages_blocks_quick_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_quick_links_parent_id_idx" ON "pages_blocks_quick_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quick_links_path_idx" ON "pages_blocks_quick_links" USING btree ("_path");
  CREATE INDEX "pages_blocks_quick_links_locale_idx" ON "pages_blocks_quick_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_grid_items_order_idx" ON "pages_blocks_logo_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_grid_items_parent_id_idx" ON "pages_blocks_logo_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_grid_items_locale_idx" ON "pages_blocks_logo_grid_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_grid_items_logo_idx" ON "pages_blocks_logo_grid_items" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_logo_grid_order_idx" ON "pages_blocks_logo_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_grid_parent_id_idx" ON "pages_blocks_logo_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_grid_path_idx" ON "pages_blocks_logo_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_logo_grid_locale_idx" ON "pages_blocks_logo_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_band_links_order_idx" ON "pages_blocks_cta_band_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_links_parent_id_idx" ON "pages_blocks_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_links_locale_idx" ON "pages_blocks_cta_band_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_band_locale_idx" ON "pages_blocks_cta_band" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_locale_idx" ON "pages_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_items_media_idx" ON "pages_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_accordion_items_order_idx" ON "_pages_v_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_accordion_items_parent_id_idx" ON "_pages_v_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_accordion_items_locale_idx" ON "_pages_v_blocks_accordion_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_accordion_order_idx" ON "_pages_v_blocks_accordion" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_accordion_parent_id_idx" ON "_pages_v_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_accordion_path_idx" ON "_pages_v_blocks_accordion" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_accordion_locale_idx" ON "_pages_v_blocks_accordion" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_banner_order_idx" ON "_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_parent_id_idx" ON "_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_path_idx" ON "_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_locale_idx" ON "_pages_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_split_section_links_order_idx" ON "_pages_v_blocks_split_section_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_section_links_parent_id_idx" ON "_pages_v_blocks_split_section_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_section_links_locale_idx" ON "_pages_v_blocks_split_section_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_split_section_order_idx" ON "_pages_v_blocks_split_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_section_parent_id_idx" ON "_pages_v_blocks_split_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_section_path_idx" ON "_pages_v_blocks_split_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_split_section_locale_idx" ON "_pages_v_blocks_split_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_split_section_media_idx" ON "_pages_v_blocks_split_section" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_order_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_parent_id_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_locale_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_media_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_card_grid_order_idx" ON "_pages_v_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_parent_id_idx" ON "_pages_v_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_path_idx" ON "_pages_v_blocks_card_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_card_grid_locale_idx" ON "_pages_v_blocks_card_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_quick_links_links_order_idx" ON "_pages_v_blocks_quick_links_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quick_links_links_parent_id_idx" ON "_pages_v_blocks_quick_links_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quick_links_links_locale_idx" ON "_pages_v_blocks_quick_links_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_quick_links_order_idx" ON "_pages_v_blocks_quick_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quick_links_parent_id_idx" ON "_pages_v_blocks_quick_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quick_links_path_idx" ON "_pages_v_blocks_quick_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quick_links_locale_idx" ON "_pages_v_blocks_quick_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_grid_items_order_idx" ON "_pages_v_blocks_logo_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_grid_items_parent_id_idx" ON "_pages_v_blocks_logo_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_grid_items_locale_idx" ON "_pages_v_blocks_logo_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_grid_items_logo_idx" ON "_pages_v_blocks_logo_grid_items" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_logo_grid_order_idx" ON "_pages_v_blocks_logo_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_grid_parent_id_idx" ON "_pages_v_blocks_logo_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_grid_path_idx" ON "_pages_v_blocks_logo_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_logo_grid_locale_idx" ON "_pages_v_blocks_logo_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_band_links_order_idx" ON "_pages_v_blocks_cta_band_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_links_parent_id_idx" ON "_pages_v_blocks_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_links_locale_idx" ON "_pages_v_blocks_cta_band_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_band_order_idx" ON "_pages_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_parent_id_idx" ON "_pages_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_path_idx" ON "_pages_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_band_locale_idx" ON "_pages_v_blocks_cta_band" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_locale_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_items_media_idx" ON "_pages_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_logo_id_media_id_fk" FOREIGN KEY ("hero_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_logo_id_media_id_fk" FOREIGN KEY ("version_hero_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_hero_logo_idx" ON "pages" USING btree ("hero_logo_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_logo_idx" ON "_pages_v" USING btree ("version_hero_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_section_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_split_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_card_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_card_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quick_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quick_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_logo_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_logo_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_band_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_section_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_split_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_card_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quick_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quick_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_logo_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_logo_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_band_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_accordion_items" CASCADE;
  DROP TABLE "pages_blocks_accordion" CASCADE;
  DROP TABLE "pages_blocks_banner" CASCADE;
  DROP TABLE "pages_blocks_split_section_links" CASCADE;
  DROP TABLE "pages_blocks_split_section" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_card_grid" CASCADE;
  DROP TABLE "pages_blocks_quick_links_links" CASCADE;
  DROP TABLE "pages_blocks_quick_links" CASCADE;
  DROP TABLE "pages_blocks_logo_grid_items" CASCADE;
  DROP TABLE "pages_blocks_logo_grid" CASCADE;
  DROP TABLE "pages_blocks_cta_band_links" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_accordion_items" CASCADE;
  DROP TABLE "_pages_v_blocks_accordion" CASCADE;
  DROP TABLE "_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_split_section_links" CASCADE;
  DROP TABLE "_pages_v_blocks_split_section" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_quick_links_links" CASCADE;
  DROP TABLE "_pages_v_blocks_quick_links" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_logo_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_logo_id_media_id_fk";
  
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  DROP INDEX "pages_hero_hero_logo_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_logo_idx";
  ALTER TABLE "pages" DROP COLUMN "hero_logo_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_logo_id";
  DROP TYPE "public"."enum_pages_blocks_accordion_theme";
  DROP TYPE "public"."enum_pages_blocks_banner_style";
  DROP TYPE "public"."enum_pages_blocks_split_section_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_split_section_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_split_section_media_position";
  DROP TYPE "public"."enum_pages_blocks_split_section_media_aspect";
  DROP TYPE "public"."enum_pages_blocks_split_section_theme";
  DROP TYPE "public"."enum_pages_blocks_card_grid_cards_link_type";
  DROP TYPE "public"."enum_pages_blocks_card_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_card_grid_theme";
  DROP TYPE "public"."enum_pages_blocks_quick_links_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_quick_links_style";
  DROP TYPE "public"."enum_pages_blocks_quick_links_theme";
  DROP TYPE "public"."enum_pages_blocks_logo_grid_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_logo_grid_style";
  DROP TYPE "public"."enum_pages_blocks_logo_grid_theme";
  DROP TYPE "public"."enum_pages_blocks_cta_band_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_band_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_band_alignment";
  DROP TYPE "public"."enum_pages_blocks_cta_band_theme";
  DROP TYPE "public"."enum_pages_blocks_gallery_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_gallery_layout";
  DROP TYPE "public"."enum_pages_blocks_gallery_theme";
  DROP TYPE "public"."enum__pages_v_blocks_accordion_theme";
  DROP TYPE "public"."enum__pages_v_blocks_banner_style";
  DROP TYPE "public"."enum__pages_v_blocks_split_section_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_split_section_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_split_section_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_split_section_media_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_split_section_theme";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_cards_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_theme";
  DROP TYPE "public"."enum__pages_v_blocks_quick_links_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_quick_links_style";
  DROP TYPE "public"."enum__pages_v_blocks_quick_links_theme";
  DROP TYPE "public"."enum__pages_v_blocks_logo_grid_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_logo_grid_style";
  DROP TYPE "public"."enum__pages_v_blocks_logo_grid_theme";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_theme";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_layout";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_theme";`)
}
