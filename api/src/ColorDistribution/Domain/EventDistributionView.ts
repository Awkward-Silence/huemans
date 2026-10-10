import { ColorValue } from './ValueObject/Color';
import { PersonalityTypeValue } from './ValueObject/PersonalityType';

export interface EventDistributionView {
  eventId: string;
  groups: { color: ColorValue; members: number; personalityTypes: PersonalityTypeValue[] }[];
}
