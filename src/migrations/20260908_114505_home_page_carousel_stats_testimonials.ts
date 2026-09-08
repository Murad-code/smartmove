import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_testimonials_items_role" AS ENUM('tenant', 'landlord', 'seller');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_background" AS ENUM('white', 'grey');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_items_role" AS ENUM('tenant', 'landlord', 'seller');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_background" AS ENUM('white', 'grey');
  CREATE TYPE "public"."enum_services_blocks_testimonials_items_role" AS ENUM('tenant', 'landlord', 'seller');
  CREATE TYPE "public"."enum_services_blocks_testimonials_background" AS ENUM('white', 'grey');
  CREATE TYPE "public"."enum__services_v_blocks_testimonials_items_role" AS ENUM('tenant', 'landlord', 'seller');
  CREATE TYPE "public"."enum__services_v_blocks_testimonials_background" AS ENUM('white', 'grey');
  CREATE TYPE "public"."enum_home_page_why_us_reasons_icon" AS ENUM('key', 'house', 'shield', 'spanner', 'chart', 'document', 'people', 'pound');
  CREATE TYPE "public"."enum_home_page_testimonials_items_role" AS ENUM('tenant', 'landlord', 'seller');
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" "enum_pages_blocks_testimonials_items_role" DEFAULT 'tenant'
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_pages_blocks_testimonials_background" DEFAULT 'grey',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" "enum__pages_v_blocks_testimonials_items_role" DEFAULT 'tenant',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum__pages_v_blocks_testimonials_background" DEFAULT 'grey',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" "enum_services_blocks_testimonials_items_role" DEFAULT 'tenant'
  );
  
  CREATE TABLE "services_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_services_blocks_testimonials_background" DEFAULT 'grey',
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" "enum__services_v_blocks_testimonials_items_role" DEFAULT 'tenant',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum__services_v_blocks_testimonials_background" DEFAULT 'grey',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar
  );
  
  CREATE TABLE "home_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_home_page_testimonials_items_role" DEFAULT 'tenant'
  );
  
  ALTER TABLE "home_page" DROP CONSTRAINT "home_page_hero_image_id_media_id_fk";
  
  DROP INDEX "home_page_hero_hero_image_idx";
  ALTER TABLE "home_page_why_us_reasons" ADD COLUMN "icon" "enum_home_page_why_us_reasons_icon" DEFAULT 'shield';
  ALTER TABLE "home_page" ADD COLUMN "hero_autoplay" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "testimonials_heading" varchar DEFAULT 'What people say about us';
  ALTER TABLE "home_page" ADD COLUMN "testimonials_intro" varchar;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials_items" ADD CONSTRAINT "services_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials" ADD CONSTRAINT "services_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_testimonials_items" ADD CONSTRAINT "_services_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_testimonials" ADD CONSTRAINT "_services_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_stats" ADD CONSTRAINT "home_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_testimonials_items" ADD CONSTRAINT "home_page_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "services_blocks_testimonials_items_order_idx" ON "services_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_items_parent_id_idx" ON "services_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_order_idx" ON "services_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_parent_id_idx" ON "services_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_path_idx" ON "services_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_testimonials_items_order_idx" ON "_services_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_testimonials_items_parent_id_idx" ON "_services_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_testimonials_order_idx" ON "_services_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_testimonials_parent_id_idx" ON "_services_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_testimonials_path_idx" ON "_services_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "home_page_hero_slides_order_idx" ON "home_page_hero_slides" USING btree ("_order");
  CREATE INDEX "home_page_hero_slides_parent_id_idx" ON "home_page_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_slides_image_idx" ON "home_page_hero_slides" USING btree ("image_id");
  CREATE INDEX "home_page_stats_order_idx" ON "home_page_stats" USING btree ("_order");
  CREATE INDEX "home_page_stats_parent_id_idx" ON "home_page_stats" USING btree ("_parent_id");
  CREATE INDEX "home_page_testimonials_items_order_idx" ON "home_page_testimonials_items" USING btree ("_order");
  CREATE INDEX "home_page_testimonials_items_parent_id_idx" ON "home_page_testimonials_items" USING btree ("_parent_id");
  ALTER TABLE "home_page" DROP COLUMN "hero_heading";
  ALTER TABLE "home_page" DROP COLUMN "hero_subheading";
  ALTER TABLE "home_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "home_page" DROP COLUMN "hero_primary_cta_label";
  ALTER TABLE "home_page" DROP COLUMN "hero_primary_cta_href";
  ALTER TABLE "home_page" DROP COLUMN "hero_secondary_cta_label";
  ALTER TABLE "home_page" DROP COLUMN "hero_secondary_cta_href";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_hero_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_testimonials_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "services_blocks_testimonials_items" CASCADE;
  DROP TABLE "services_blocks_testimonials" CASCADE;
  DROP TABLE "_services_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_services_v_blocks_testimonials" CASCADE;
  DROP TABLE "home_page_hero_slides" CASCADE;
  DROP TABLE "home_page_stats" CASCADE;
  DROP TABLE "home_page_testimonials_items" CASCADE;
  ALTER TABLE "home_page" ADD COLUMN "hero_heading" varchar NOT NULL;
  ALTER TABLE "home_page" ADD COLUMN "hero_subheading" varchar;
  ALTER TABLE "home_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "hero_primary_cta_label" varchar;
  ALTER TABLE "home_page" ADD COLUMN "hero_primary_cta_href" varchar;
  ALTER TABLE "home_page" ADD COLUMN "hero_secondary_cta_label" varchar;
  ALTER TABLE "home_page" ADD COLUMN "hero_secondary_cta_href" varchar;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_page_hero_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  ALTER TABLE "home_page_why_us_reasons" DROP COLUMN "icon";
  ALTER TABLE "home_page" DROP COLUMN "hero_autoplay";
  ALTER TABLE "home_page" DROP COLUMN "testimonials_heading";
  ALTER TABLE "home_page" DROP COLUMN "testimonials_intro";
  DROP TYPE "public"."enum_pages_blocks_testimonials_items_role";
  DROP TYPE "public"."enum_pages_blocks_testimonials_background";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_items_role";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_background";
  DROP TYPE "public"."enum_services_blocks_testimonials_items_role";
  DROP TYPE "public"."enum_services_blocks_testimonials_background";
  DROP TYPE "public"."enum__services_v_blocks_testimonials_items_role";
  DROP TYPE "public"."enum__services_v_blocks_testimonials_background";
  DROP TYPE "public"."enum_home_page_why_us_reasons_icon";
  DROP TYPE "public"."enum_home_page_testimonials_items_role";`)
}
