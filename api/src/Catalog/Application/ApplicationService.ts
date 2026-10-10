import { Inject, Injectable } from '@nestjs/common';
import { Icebreaker } from '@Huemans/Catalog/Domain/Icebreaker';
import { PersonalityTypeProfile } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { CATALOG_REPOSITORY, CatalogRepository } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { Question } from '@Huemans/Catalog/Domain/Question';
import { TraitTypeMapping } from '@Huemans/Catalog/Domain/TraitTypeMapping';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

/** Catalog's in-process reads for the other contexts. */
@Injectable()
export class ApplicationService {
  constructor(@Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository) {}

  allQuestions(): Promise<Question[]> {
    return this.catalog.allQuestions();
  }

  allIcebreakers(): Promise<Icebreaker[]> {
    return this.catalog.allIcebreakers();
  }

  profileOf(type: string): Promise<PersonalityTypeProfile> {
    return this.catalog.profileOf(new PersonalityType(type));
  }

  mapping(): Promise<TraitTypeMapping> {
    return this.catalog.mapping();
  }
}
