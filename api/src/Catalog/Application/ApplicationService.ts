import { Inject, Injectable } from '@nestjs/common';
import { IcebreakerDTO } from '@Huemans/Catalog/Domain/Icebreaker';
import { PersonalityTypeProfileDTO } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { CATALOG_REPOSITORY, CatalogRepository } from '@Huemans/Catalog/Domain/Port/CatalogRepository';
import { QuestionDTO } from '@Huemans/Catalog/Domain/Question';
import { TraitTypeMappingDTO } from '@Huemans/Catalog/Domain/PersonalityTypes';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

/** Catalog's in-process reads for the other contexts. */
@Injectable()
export class ApplicationService {
  constructor(@Inject(CATALOG_REPOSITORY) private readonly catalog: CatalogRepository) {}

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
}
