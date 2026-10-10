import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { IcebreakerRepository } from '@Huemans/Catalog/Domain/Port/IcebreakerRepository';
import { Icebreaker, IcebreakerSchema } from '@Huemans/Types/Icebreaker';
import { CatalogIcebreakerSchema } from './CatalogIcebreakerSchema';

@Injectable()
export class MikroOrmIcebreakerRepository implements IcebreakerRepository {
  constructor(private readonly em: EntityManager) {}

  async all(): Promise<Icebreaker[]> {
    const rows = await this.em.find(CatalogIcebreakerSchema, {}, { orderBy: { id: 'asc' }, disableIdentityMap: true });
    return rows.map(({ id, theme, text, traits }) => IcebreakerSchema.parse({ id, theme, text, traits }));
  }

  async upsert(icebreakers: Icebreaker[]): Promise<void> {
    if (icebreakers.length === 0) {
      return;
    }
    await this.em.upsertMany(
      CatalogIcebreakerSchema,
      icebreakers.map(({ id, theme, text, traits }) => ({ id, theme, text, traits })),
    );
  }
}
