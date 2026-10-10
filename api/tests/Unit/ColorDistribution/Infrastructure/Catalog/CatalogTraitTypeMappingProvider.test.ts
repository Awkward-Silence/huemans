import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { TraitTypeMappingDTO } from '@Huemans/Catalog/Domain/PersonalityTypes';
import { CatalogTraitTypeMappingProvider } from '@Huemans/ColorDistribution/Infrastructure/Catalog/CatalogTraitTypeMappingProvider';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('CatalogTraitTypeMappingProvider', () => {
  let catalogMapping: jest.Mock<Promise<TraitTypeMappingDTO>, []>;
  let provider: CatalogTraitTypeMappingProvider;

  beforeEach(() => {
    const allPlanner = Object.fromEntries(TRAITS.map((trait) => [trait, 'planner'])) as TraitTypeMappingDTO;
    catalogMapping = jest.fn(() => Promise.resolve(allPlanner));
    provider = new CatalogTraitTypeMappingProvider({ mapping: catalogMapping } as unknown as CatalogService);
  });

  it('testBuildsTheMappingFromTheCatalog', async () => {
    const mapping = await provider.mapping();

    expect(mapping.typeOf(new Trait('curious')).value).toBe('planner');
  });

  it('testReadsTheCatalogOnlyOnce', async () => {
    await provider.mapping();
    await provider.mapping();

    expect(catalogMapping).toHaveBeenCalledTimes(1);
  });

  it('testRetriesAfterAFailedRead', async () => {
    catalogMapping.mockRejectedValueOnce(new Error('not seeded'));

    await expect(provider.mapping()).rejects.toThrow('not seeded');
    await expect(provider.mapping()).resolves.toBeDefined();
  });
});
