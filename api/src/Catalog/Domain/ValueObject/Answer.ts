import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { AnswerId } from './AnswerId';

/** One selectable answer; picking it hints at its trait. */
export class Answer {
  constructor(
    readonly id: AnswerId,
    readonly text: string,
    readonly trait: Trait,
  ) {
    if (text.trim() === '') {
      throw new InvalidArgumentError(`<Answer> <${id.value}> needs a text`);
    }
  }
}
