import { EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '@Huemans/Catalog/Domain/Port/QuestionRepository';
import { Question, QuestionSchema } from '@Huemans/Types/Question';
import { CatalogAnswerSchema } from './CatalogAnswerSchema';
import { CatalogQuestionRow, CatalogQuestionSchema } from './CatalogQuestionSchema';

@Injectable()
export class MikroOrmQuestionRepository implements QuestionRepository {
  constructor(private readonly em: EntityManager) {}

  all(): Promise<Question[]> {
    return this.load({});
  }

  async byIds(ids: string[]): Promise<Question[]> {
    return ids.length === 0 ? [] : this.load({ id: { $in: ids } });
  }

  async upsert(questions: Question[]): Promise<void> {
    if (questions.length === 0) {
      return;
    }
    await this.em.upsertMany(
      CatalogQuestionSchema,
      questions.map(({ id, theme, text }) => ({ id, theme, text })),
    );
    await this.em.upsertMany(
      CatalogAnswerSchema,
      questions.flatMap((question) =>
        question.answers.map(({ id, text, trait }, position) => ({
          id,
          questionId: question.id,
          position,
          text,
          trait,
        })),
      ),
    );
  }

  private async load(where: FilterQuery<CatalogQuestionRow>): Promise<Question[]> {
    const rows = await this.em.find(CatalogQuestionSchema, where, { orderBy: { id: 'asc' }, disableIdentityMap: true });
    const answers = await this.em.find(
      CatalogAnswerSchema,
      { questionId: { $in: rows.map((row) => row.id) } },
      { orderBy: { position: 'asc' }, disableIdentityMap: true },
    );

    // Parsed with the content schema, so a row the seed did not validate never leaves the repository.
    return rows.map(({ id, theme, text }) =>
      QuestionSchema.parse({
        id,
        theme,
        text,
        answers: answers
          .filter((answer) => answer.questionId === id)
          .map((answer) => ({ id: answer.id, text: answer.text, trait: answer.trait })),
      }),
    );
  }
}
