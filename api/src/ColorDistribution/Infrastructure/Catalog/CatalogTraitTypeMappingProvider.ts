import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { TraitTypeMappingProvider } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Turns the catalog's mapping into this context's value object, which owns the rule that uses it.
@Injectable()
export class CatalogTraitTypeMappingProvider implements TraitTypeMappingProvider {
  constructor(private readonly catalog: CatalogService) {}

  async mapping(): Promise<TraitTypeMapping> {
    return new TraitTypeMapping(
      Object.entries(await this.catalog.mapping()).map(
        ([trait, type]) => [new Trait(trait), new PersonalityType(type)] as const,
      ),
    );
  }
}
