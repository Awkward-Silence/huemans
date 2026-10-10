import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { IcebreakerAuthored } from './Event/IcebreakerAuthored';
import { IcebreakerId } from './ValueObject/IcebreakerId';
import { IcebreakerText } from './ValueObject/IcebreakerText';
import { IcebreakerTraitCollection } from './ValueObject/IcebreakerTraitCollection';
import { Theme, ThemeValue } from './ValueObject/Theme';

export interface IcebreakerDTO {
  id: string;
  theme: ThemeValue;
  text: string;
  traits: TraitValue[];
}

/** An open question to start a conversation, and the traits it suits; authored once, at the seed. */
export class Icebreaker extends AggregateRoot {
  private constructor(
    readonly id: IcebreakerId,
    readonly theme: Theme,
    readonly text: IcebreakerText,
    readonly traits: IcebreakerTraitCollection,
  ) {
    super();
  }

  static author(id: IcebreakerId, theme: Theme, text: IcebreakerText, traits: IcebreakerTraitCollection): Icebreaker {
    const icebreaker = new Icebreaker(id, theme, text, traits);
    icebreaker.record(new IcebreakerAuthored(id.value));
    return icebreaker;
  }

  /** A stored icebreaker, read back: nothing happened, so nothing is recorded. */
  static rebuild(id: IcebreakerId, theme: Theme, text: IcebreakerText, traits: IcebreakerTraitCollection): Icebreaker {
    return new Icebreaker(id, theme, text, traits);
  }

  toDTO(): IcebreakerDTO {
    return {
      id: this.id.value,
      theme: this.theme.value,
      text: this.text.value,
      traits: this.traits.all().map((trait) => trait.value),
    };
  }
}
