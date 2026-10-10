import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { TraitTypeMappingProvider } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Turns the catalog's mapping into this context's value object, which owns the rule that uses it. Catalog content
// never changes while the app runs, so it is read once (a re-seed needs a restart); a failed read is retried.
@Injectable()
export class CatalogTraitTypeMappingProvider implements TraitTypeMappingProvider {
  private cached?: TraitTypeMapping;

  constructor(private readonly catalog: CatalogService) {}

  async mapping(): Promise<TraitTypeMapping> {
    this.cached ??= new TraitTypeMapping(
      Object.entries(await this.catalog.mapping()).map(
        ([trait, type]) => [new Trait(trait), new PersonalityType(type)] as const,
      ),
    );
    return this.cached;
  }
}
