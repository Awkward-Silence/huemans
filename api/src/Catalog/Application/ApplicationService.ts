import { Inject, Injectable } from '@nestjs/common';
import { AuthoredCatalog } from '@Huemans/Catalog/Domain/AuthoredCatalog';
import { IcebreakerDTO } from '@Huemans/Catalog/Domain/Icebreaker';
import { PersonalityTypeProfileDTO } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { TraitTypeMappingDTO } from '@Huemans/Catalog/Domain/PersonalityTypes';
import { CATALOG_CONTENT_SOURCE, CatalogContentSource } from '@Huemans/Catalog/Domain/Port/CatalogContentSource';
import { CATALOG_REPOSITORY, CatalogRepository } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { CATALOG_SEED_RECORD, CatalogSeedRecord } from '@Huemans/Catalog/Domain/Port/CatalogSeedRecord';
import { QuestionDTO } from '@Huemans/Catalog/Domain/Question';
import { EVENT_DISPATCHER, EventDispatcher } from '@Huemans/Shared/Domain/Port/EventDispatcher';
import { TRANSACTION_MANAGER, TransactionManager } from '@Huemans/Shared/Domain/Port/TransactionManager';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

export interface CatalogCounts {
  questions: number;
  icebreakers: number;
  profiles: number;
  mappedTraits: number;
}

export type SeedResult = { seeded: true; counts: CatalogCounts } | { seeded: false; seededAt: Date | null };

/** Catalog's in-process reads for the other contexts, and the seed that writes the content once per database. */
@Injectable()
export class ApplicationService {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository,
    @Inject(CATALOG_SEED_RECORD) private readonly seedRecord: CatalogSeedRecord,
    @Inject(CATALOG_CONTENT_SOURCE) private readonly content: CatalogContentSource,
    @Inject(TRANSACTION_MANAGER) private readonly transaction: TransactionManager,
    @Inject(EVENT_DISPATCHER) private readonly dispatcher: EventDispatcher,
  ) {}

  async allQuestions(): Promise<QuestionDTO[]> {
    return (await this.catalog.allQuestions()).map((question) => question.toDTO());
  }

  async allIcebreakers(): Promise<IcebreakerDTO[]> {
    return (await this.catalog.allIcebreakers()).map((icebreaker) => icebreaker.toDTO());
  }

  async profileOf(type: string): Promise<PersonalityTypeProfileDTO> {
    return (await this.catalog.personalityTypes()).profileOf(new PersonalityType(type));
  }

  async mapping(): Promise<TraitTypeMappingDTO> {
    return (await this.catalog.personalityTypes()).toDTO().mapping;
  }

  /** Authors the content and writes it, unless the database was already seeded; then announces what it authored. */
  async seed(): Promise<SeedResult> {
    const catalog = this.content.read();

    const seeded = await this.transaction.run(async () => {
      if (!(await this.seedRecord.markSeeded(new Date()))) {
        return false;
      }
      await this.catalog.saveQuestions(catalog.questions);
      await this.catalog.saveIcebreakers(catalog.icebreakers);
      await this.catalog.savePersonalityTypes(catalog.personalityTypes);
      return true;
    });
    if (!seeded) {
      return { seeded: false, seededAt: await this.seedRecord.seededAt() };
    }

    await this.dispatcher.dispatchAll(
      [...catalog.questions, ...catalog.icebreakers, catalog.personalityTypes].flatMap((aggregate) =>
        aggregate.pullDomainEvents(),
      ),
    );
    return { seeded: true, counts: countsOf(catalog) };
  }
}

export function countsOf({ questions, icebreakers, personalityTypes }: AuthoredCatalog): CatalogCounts {
  const { profiles, mapping } = personalityTypes.toDTO();
  return {
    questions: questions.length,
    icebreakers: icebreakers.length,
    profiles: profiles.length,
    mappedTraits: Object.keys(mapping).length,
  };
}
