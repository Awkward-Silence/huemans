import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { PersonalityTypesNotDefined } from '@Huemans/Catalog/Domain/PersonalityTypesNotDefined';
import { CatalogAnswerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogPersonalityTypeProfileSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogPersonalityTypeProfileSchema';
import { CatalogQuestionSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogQuestionSchema';
import { CatalogTraitTypeSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogTraitTypeSchema';
import { MikroOrmCatalogRepository } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmCatalogRepository';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { CATALOG_CONTENT_SOURCE } from '@Huemans/Catalog/Domain/Port/CatalogContentSource';
import { CATALOG_REPOSITORY } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { CATALOG_SEED_RECORD } from '@Huemans/Catalog/Domain/Port/CatalogSeedRecord';
import { JsonCatalogContentSource } from '@Huemans/Catalog/Infrastructure/Content/JsonCatalogContentSource';
import { CatalogSeedSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogSeedSchema';
import { MikroOrmCatalogSeedRecord } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmCatalogSeedRecord';
import { EVENT_DISPATCHER } from '@Huemans/Shared/Domain/Port/EventDispatcher';
import { TRANSACTION_MANAGER } from '@Huemans/Shared/Domain/Port/TransactionManager';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';
import { MikroOrmTransactionManager } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmTransactionManager';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import {
  aQuestion,
  anIcebreaker,
  realContent,
  removeCatalogFixtures,
  seedCatalogFiles,
} from '../../../../Support/catalog';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrmCatalogRepository', () => {
  let module: TestingModule;
  let repository: MikroOrmCatalogRepository;

  beforeAll(async () => {
    module = await bootIntegration({
      entities: [
        CatalogQuestionSchema,
        CatalogAnswerSchema,
        CatalogIcebreakerSchema,
        CatalogPersonalityTypeProfileSchema,
        CatalogTraitTypeSchema,
        CatalogSeedSchema,
      ],
      providers: [
        MikroOrmCatalogRepository,
        CatalogService,
        { provide: CATALOG_REPOSITORY, useExisting: MikroOrmCatalogRepository },
        { provide: CATALOG_SEED_RECORD, useClass: MikroOrmCatalogSeedRecord },
        { provide: CATALOG_CONTENT_SOURCE, useFactory: () => new JsonCatalogContentSource() },
        { provide: TRANSACTION_MANAGER, useClass: MikroOrmTransactionManager },
        { provide: EVENT_DISPATCHER, useClass: InMemoryEventDispatcher },
      ],
    });
    repository = module.get(MikroOrmCatalogRepository);
    await seedCatalogFiles(module);
  });

  afterAll(async () => {
    await removeCatalogFixtures(module.get(EntityManager).fork());
    await module.close();
  });

  it('testSavesQuestionsAndListsThemOrderedByIdWithAnswersInOrder', async () => {
    const question = aQuestion(['thrifty', 'chaotic', 'loyal', 'romantic']);
    await repository.saveQuestions([question]);

    const all = await repository.allQuestions();
    const ids = all.map((found) => found.id.value);

    expect(ids).toEqual([...ids].sort());
    expect(all.find((found) => found.id.equals(question.id))?.toDTO()).toEqual(question.toDTO());
  });

  it('testReadingAQuestionBackRecordsNothing', async () => {
    const question = aQuestion();
    await repository.saveQuestions([question]);

    const found = (await repository.allQuestions()).find((candidate) => candidate.id.equals(question.id))!;

    expect(found.pullDomainEvents()).toEqual([]);
  });

  it('testSavesIcebreakersAndListsThemOrderedById', async () => {
    const icebreaker = anIcebreaker(['humorous', 'curious']);
    await repository.saveIcebreakers([icebreaker]);

    const all = await repository.allIcebreakers();
    const ids = all.map((found) => found.id.value);

    expect(ids).toEqual([...ids].sort());
    expect(all.find((found) => found.id.equals(icebreaker.id))?.toDTO()).toEqual(icebreaker.toDTO());
  });

  it('testReadsThePersonalityTypes', async () => {
    const { profiles, mapping } = realContent();

    const personalityTypes = await repository.personalityTypes();

    expect(personalityTypes.profileOf(new PersonalityType('dreamer'))).toEqual(
      profiles.find((profile) => profile.type === 'dreamer'),
    );
    expect(personalityTypes.toDTO().mapping).toEqual(mapping);
  });

  it('testMissingPersonalityTypesAreNotDefined', async () => {
    // Profiles and mapping have fixed keys shared by parallel suites, so empty tables are simulated instead of emptied.
    const unseeded = new MikroOrmCatalogRepository({ find: () => Promise.resolve([]) } as unknown as EntityManager);

    await expect(unseeded.personalityTypes()).rejects.toThrow(PersonalityTypesNotDefined);
  });
});
