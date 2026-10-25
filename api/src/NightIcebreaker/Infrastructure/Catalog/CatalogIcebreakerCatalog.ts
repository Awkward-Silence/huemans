import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { IcebreakerCatalog } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerCatalog';
import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';

@Injectable()
export class CatalogIcebreakerCatalog implements IcebreakerCatalog {
  constructor(private readonly catalog: CatalogService) {}

  async candidates(): Promise<IcebreakerCandidate[]> {
    return (await this.catalog.allIcebreakers()).map((icebreaker) => IcebreakerCandidate.fromPrimitives(icebreaker));
  }
}
