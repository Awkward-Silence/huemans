import { InvalidArgumentError } from '../InvalidArgumentError';
import { NumberValueObject } from './NumberValueObject';

/** How much one piece of evidence points to a trait: above 0, and never more than one whole answer (1). */
export class TraitWeight extends NumberValueObject {
  static readonly WHOLE_ANSWER = 1;

  constructor(value: number) {
    if (!Number.isFinite(value) || value <= 0 || value > TraitWeight.WHOLE_ANSWER) {
      throw new InvalidArgumentError(`<TraitWeight> must be above 0 and at most 1, got <${value}>`);
    }
    super(value);
  }

  static wholeAnswer(): TraitWeight {
    return new TraitWeight(TraitWeight.WHOLE_ANSWER);
  }
}
