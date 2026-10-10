import { Injectable } from '@nestjs/common';
import { TraitTypeMappingProvider } from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { PersonalityType, PersonalityTypeValue } from '@Huemans/ColorDistribution/Domain/ValueObject/PersonalityType';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { Trait, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Stand-in until the catalog lane ships the real table; replacing it is a data change only.
const PROVISIONAL: Record<TraitValue, PersonalityTypeValue> = {
  adventurous: 'explorer',
  ambitious: 'explorer',
  chaotic: 'explorer',
  competitive: 'explorer',
  curious: 'explorer',
  independent: 'explorer',
  rebellious: 'explorer',
  spontaneous: 'explorer',
  diplomatic: 'connector',
  easygoing: 'connector',
  empathetic: 'connector',
  generous: 'connector',
  humorous: 'connector',
  loyal: 'connector',
  optimistic: 'connector',
  sociable: 'connector',
  analytical: 'planner',
  cautious: 'planner',
  organized: 'planner',
  patient: 'planner',
  perfectionist: 'planner',
  practical: 'planner',
  skeptical: 'planner',
  thrifty: 'planner',
  traditional: 'planner',
  'comfort-loving': 'dreamer',
  creative: 'dreamer',
  dramatic: 'dreamer',
  honest: 'dreamer',
  introverted: 'dreamer',
  nostalgic: 'dreamer',
  romantic: 'dreamer',
  stubborn: 'dreamer',
};

@Injectable()
export class ProvisionalTraitTypeMappingProvider implements TraitTypeMappingProvider {
  private readonly provisional = new TraitTypeMapping(
    Object.entries(PROVISIONAL).map(([trait, type]) => [new Trait(trait), new PersonalityType(type)] as const),
  );

  mapping(): Promise<TraitTypeMapping> {
    return Promise.resolve(this.provisional);
  }
}
