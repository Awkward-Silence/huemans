import { Migration } from '@mikro-orm/migrations';

export class Migration20261010120000_color_distribution extends Migration {
  override up(): void {
    this.addSql('create table "event_distributions" ("event_id" uuid not null, primary key ("event_id"));');
    this.addSql(`create table "assignments" (
      "event_id" uuid not null references "event_distributions" ("event_id"),
      "attendee_id" uuid not null,
      "color" text not null,
      "personality_type" text not null,
      "assigned_at" timestamptz not null,
      primary key ("event_id", "attendee_id")
    );`);
  }

  override down(): void {
    this.addSql('drop table if exists "assignments";');
    this.addSql('drop table if exists "event_distributions";');
  }
}
