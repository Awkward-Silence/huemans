import { Migration } from '@mikro-orm/migrations';

export class Migration20261010210000_catalog_answer_position extends Migration {
  override up(): void {
    this.addSql(
      'alter table "catalog_answers" add constraint "catalog_answers_question_id_position_unique" unique ("question_id", "position");',
    );
  }

  override down(): void {
    this.addSql('alter table "catalog_answers" drop constraint "catalog_answers_question_id_position_unique";');
  }
}
