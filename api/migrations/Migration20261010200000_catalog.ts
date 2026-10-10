import { Migration } from '@mikro-orm/migrations';

export class Migration20261010200000_catalog extends Migration {
  override up(): void {
    this.addSql(`create table "catalog_questions" (
      "id" text not null,
      "theme" text not null,
      "text" text not null,
      primary key ("id")
    );`);
    this.addSql(`create table "catalog_answers" (
      "id" text not null,
      "question_id" text not null references "catalog_questions" ("id"),
      "position" int not null,
      "text" text not null,
      "trait" text not null,
      primary key ("id")
    );`);
    this.addSql('create index "catalog_answers_question_id_index" on "catalog_answers" ("question_id");');
    this.addSql(`create table "catalog_icebreakers" (
      "id" text not null,
      "theme" text not null,
      "text" text not null,
      "traits" text[] not null,
      primary key ("id")
    );`);
    this.addSql(`create table "catalog_personality_type_profiles" (
      "type" text not null,
      "nickname" text not null,
      "blurb" text not null,
      "traits" text[] not null,
      primary key ("type")
    );`);
    this.addSql(`create table "catalog_trait_types" (
      "trait" text not null,
      "personality_type" text not null,
      primary key ("trait")
    );`);
  }

  override down(): void {
    this.addSql('drop table if exists "catalog_trait_types";');
    this.addSql('drop table if exists "catalog_personality_type_profiles";');
    this.addSql('drop table if exists "catalog_icebreakers";');
    this.addSql('drop table if exists "catalog_answers";');
    this.addSql('drop table if exists "catalog_questions";');
  }
}
