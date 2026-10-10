import { IcebreakerId } from './ValueObject/IcebreakerId';
import { IcebreakerTraitCollection } from './ValueObject/IcebreakerTraitCollection';
import { Theme } from './ValueObject/Theme';

/** Read model: an open question to start a conversation, and the traits it suits. */
export class Icebreaker {
  constructor(
    readonly id: IcebreakerId,
    readonly theme: Theme,
    readonly text: string,
    readonly traits: IcebreakerTraitCollection,
  ) {}
}
