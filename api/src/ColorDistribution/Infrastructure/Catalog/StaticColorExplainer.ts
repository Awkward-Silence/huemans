import { Injectable } from '@nestjs/common';
import { PERSONALITY_TYPE_PROFILES } from '@Huemans/Catalog/Infrastructure/Content/PersonalityTypeProfiles';
import { AttendeeAssignmentView } from '@Huemans/ColorDistribution/Domain/AttendeeAssignmentView';
import { ColorExplainer, ColorExplanation } from '@Huemans/ColorDistribution/Domain/Port/ColorExplainer';

// The fallback copy; the ColorExplainer agent may later personalize it behind the same port.
@Injectable()
export class StaticColorExplainer implements ColorExplainer {
  explain({ color, personalityType }: AttendeeAssignmentView): Promise<ColorExplanation> {
    const { nickname, blurb, traits } = PERSONALITY_TYPE_PROFILES[personalityType];
    return Promise.resolve({
      nickname,
      blurb,
      traits,
      reason: `Most of your answers were ${personalityType} answers. Groups are mixed on purpose, and ${color} had room for another ${personalityType}.`,
    });
  }
}
