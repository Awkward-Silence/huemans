import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { IcebreakerId } from './ValueObject/IcebreakerId';
import { IcebreakerTraitCollection } from './ValueObject/IcebreakerTraitCollection';
import { Theme, ThemeValue } from './ValueObject/Theme';

export interface IcebreakerDTO {
  id: string;
  theme: ThemeValue;
  text: string;
  traits: TraitValue[];
}

/** Read model: an open question to start a conversation, and the traits it suits. */
export class Icebreaker {
  constructor(
    readonly id: IcebreakerId,
    readonly theme: Theme,
    readonly text: string,
    readonly traits: IcebreakerTraitCollection,
  ) {}

  toDTO(): IcebreakerDTO {
    return {
      id: this.id.value,
      theme: this.theme.value,
      text: this.text,
      traits: this.traits.all().map((trait) => trait.value),
    };
  }
}
