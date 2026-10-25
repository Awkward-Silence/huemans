import { Migration } from '@mikro-orm/migrations';

export class Migration20261025200000_participation_attendees extends Migration {
  override up(): void {
    this.addSql(`create table "attendees" (
      "id" uuid not null,
      "event_id" uuid not null,
      "name" varchar(40) not null,
      "joined_at" timestamptz not null,
      primary key ("id")
    );`);
    this.addSql('create index "attendees_event_id_index" on "attendees" ("event_id");');
  }

  override down(): void {
    this.addSql('drop table if exists "attendees";');
  }
}
