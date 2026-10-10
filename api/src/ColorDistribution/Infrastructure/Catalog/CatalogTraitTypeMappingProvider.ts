import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { TraitTypeMappingProvider } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';

// Turns the catalog's mapping read model into this context's value object, which owns the rule that uses it.
@Injectable()
export class CatalogTraitTypeMappingProvider implements TraitTypeMappingProvider {
  constructor(private readonly catalog: CatalogService) {}

  async mapping(): Promise<TraitTypeMapping> {
    return new TraitTypeMapping((await this.catalog.mapping()).pairs);
  }
}
