import { ColorValue } from '@Huemans/Shared/Domain/ValueObject/Color';
import { PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

export interface EventDistributionView {
  eventId: string;
  groups: { color: ColorValue; members: number; personalityTypes: PersonalityTypeValue[] }[];
}
