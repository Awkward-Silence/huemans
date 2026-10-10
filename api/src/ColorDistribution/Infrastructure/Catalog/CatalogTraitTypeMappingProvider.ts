import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { TraitTypeMappingProvider } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { PersonalityType } from '@Huemans/ColorDistribution/Domain/ValueObject/PersonalityType';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Translates the catalog's trait-to-type table into this context's value object.
@Injectable()
export class CatalogTraitTypeMappingProvider implements TraitTypeMappingProvider {
  constructor(private readonly catalog: CatalogService) {}

  mapping(): Promise<TraitTypeMapping> {
    return Promise.resolve(
      new TraitTypeMapping(
        Object.entries(this.catalog.traitTypeMapping()).map(
          ([trait, type]) => [new Trait(trait), new PersonalityType(type)] as const,
        ),
      ),
    );
  }
}
