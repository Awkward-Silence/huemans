import { Migration } from '@mikro-orm/migrations';

export class Migration20261010150000_event extends Migration {
  override up(): void {
    this.addSql(`create table "events" (
      "id" uuid not null,
      "name" text not null,
      "status" text not null,
      primary key ("id")
    );`);
  }

  override down(): void {
    this.addSql('drop table if exists "events";');
  }
}
