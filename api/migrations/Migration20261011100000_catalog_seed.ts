import { Migration } from '@mikro-orm/migrations';

export class Migration20261011100000_catalog_seed extends Migration {
  override up(): void {
    this.addSql(`create table "catalog_seed" (
      "id" text not null,
      "seeded_at" timestamptz not null,
      primary key ("id")
    );`);
    // Databases seeded before the seed was once-only already hold the content: record them as seeded.
    this.addSql(
      `insert into "catalog_seed" ("id", "seeded_at") select 'catalog', now() where exists (select 1 from "catalog_questions");`,
    );
  }

  override down(): void {
    this.addSql('drop table if exists "catalog_seed";');
  }
}
