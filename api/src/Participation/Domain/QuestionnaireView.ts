import { WeightedTraitPrimitives } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';

export interface QuestionnaireView {
  eventId: string;
  attendeeId: string;
  traits: WeightedTraitPrimitives[];
}
