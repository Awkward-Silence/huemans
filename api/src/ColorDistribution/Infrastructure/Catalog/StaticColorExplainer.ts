import { Injectable } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { AttendeeAssignmentView } from '@Huemans/ColorDistribution/Domain/AttendeeAssignmentView';
import { ColorExplainer, ColorExplanation } from '@Huemans/ColorDistribution/Domain/Port/ColorExplainer';

// The fallback copy, from the catalog's profile of the attendee's type; the ColorExplainer agent may later personalize it behind the same port.
@Injectable()
export class StaticColorExplainer implements ColorExplainer {
  constructor(private readonly catalog: CatalogService) {}

  async explain({ color, personalityType }: AttendeeAssignmentView): Promise<ColorExplanation> {
    const profile = await this.catalog.profileOf(personalityType);
    return {
      nickname: profile.nickname,
      blurb: profile.blurb,
      traits: profile.traits.all().map((trait) => trait.value),
      reason: `Most of your answers were ${personalityType} answers. Groups are mixed on purpose, and ${color} had room for another ${personalityType}.`,
    };
  }
}
