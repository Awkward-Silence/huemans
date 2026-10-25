import { Migration } from '@mikro-orm/migrations';

export class Migration20261025100000_night_icebreaker extends Migration {
  override up(): void {
    this.addSql(`create table "room_traits" (
      "event_id" uuid not null,
      "attendee_id" uuid not null,
      "traits" jsonb not null,
      primary key ("event_id", "attendee_id")
    );`);
    this.addSql(`create table "night_icebreakers" (
      "event_id" uuid not null,
      "icebreaker_id" text not null,
      "question" text not null,
      "why" text not null,
      "picked_at" timestamptz not null,
      primary key ("event_id")
    );`);
  }

  override down(): void {
    this.addSql('drop table if exists "night_icebreakers";');
    this.addSql('drop table if exists "room_traits";');
  }
}
