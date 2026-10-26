import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { IcebreakerId } from './IcebreakerId';
import { IcebreakerQuestion } from './IcebreakerQuestion';

/** A catalog icebreaker as this context needs it to pick one: its id, its question and the traits it suits. */
export class IcebreakerCandidate {
  private constructor(
    readonly id: IcebreakerId,
    readonly question: IcebreakerQuestion,
    readonly traits: readonly Trait[],
  ) {
    if (traits.length === 0) {
      throw new InvalidArgumentError(`<IcebreakerCandidate> <${id.value}> must suit at least one trait`);
    }
  }

  static fromPrimitives({ id, text, traits }: { id: string; text: string; traits: string[] }): IcebreakerCandidate {
    return new IcebreakerCandidate(
      new IcebreakerId(id),
      new IcebreakerQuestion(text),
      traits.map((trait) => new Trait(trait)),
    );
  }
}
