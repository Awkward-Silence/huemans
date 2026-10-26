import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

const MAX_LENGTH = 30;
// Letters, inner spaces, apostrophes and hyphens: "apologise to", "my neighbour's", "bargain-bin".
const SHAPE = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*'?$/u;

/** One pick of the sentence: a word or a short group of words, trimmed. */
export class SentenceText extends StringValueObject {
  constructor(value: string) {
    if (typeof value !== 'string') {
      throw new InvalidArgumentError('<SentenceText> must be text');
    }
    const text = value.trim();
    if (text.length === 0 || text.length > MAX_LENGTH) {
      throw new InvalidArgumentError(`<SentenceText> must be 1-${MAX_LENGTH} characters, got <${text}>`);
    }
    if (!SHAPE.test(text)) {
      throw new InvalidArgumentError(`<SentenceText> must be words only, got <${text}>`);
    }
    super(text);
  }

  sameWordsAs(other: SentenceText): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
