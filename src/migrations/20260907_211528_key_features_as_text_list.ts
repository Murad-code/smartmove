import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "properties_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  INSERT INTO "properties_texts" ("order", "parent_id", "path", "text")
  SELECT "_order", "_parent_id", 'keyFeatures', "feature"
  FROM "properties_key_features"
  ORDER BY "_parent_id", "_order";
  
  DROP TABLE "properties_key_features" CASCADE;
  ALTER TABLE "properties_texts" ADD CONSTRAINT "properties_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_texts_order_parent" ON "properties_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "properties_key_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  INSERT INTO "properties_key_features" ("_order", "_parent_id", "id", "feature")
  SELECT "order", "parent_id", gen_random_uuid()::varchar, "text"
  FROM "properties_texts"
  WHERE "path" = 'keyFeatures' AND "text" IS NOT NULL
  ORDER BY "parent_id", "order";
  
  DROP TABLE "properties_texts" CASCADE;
  ALTER TABLE "properties_key_features" ADD CONSTRAINT "properties_key_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_key_features_order_idx" ON "properties_key_features" USING btree ("_order");
  CREATE INDEX "properties_key_features_parent_id_idx" ON "properties_key_features" USING btree ("_parent_id");`)
}
