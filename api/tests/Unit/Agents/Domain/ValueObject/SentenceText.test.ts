import { SentenceText } from '@Huemans/Agents/Domain/ValueObject/SentenceText';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('SentenceText', () => {
  it('testKeepsTheTrimmedText', () => {
    expect(new SentenceText('  apologise to ').value).toBe('apologise to');
  });

  it.each(["my neighbour's", 'bargain-bin', 'all of my', 'crème brûlée', "my neighbours'"])(
    'testAccepts %s',
    (text) => {
      expect(new SentenceText(text).value).toBe(text);
    },
  );

  it.each(['', '   ', 'goat.', 'goat!', '17 goats', 'two  spaces', '-goat', 'goat 🐐'])('testRejects %j', (text) => {
    expect(() => new SentenceText(text)).toThrow(InvalidArgumentError);
  });

  it('testRejectsTextThatIsNotAString', () => {
    expect(() => new SentenceText(42 as unknown as string)).toThrow(InvalidArgumentError);
  });

  it('testAcceptsAt30Characters', () => {
    expect(new SentenceText('a'.repeat(30)).value).toHaveLength(30);
  });

  it('testRejectsMoreThan30Characters', () => {
    expect(() => new SentenceText('a'.repeat(31))).toThrow(InvalidArgumentError);
  });

  it('testComparesWordsWithoutCase', () => {
    expect(new SentenceText('Sleepy Goat').sameWordsAs(new SentenceText('sleepy goat'))).toBe(true);
    expect(new SentenceText('sleepy goat').sameWordsAs(new SentenceText('sleepy goats'))).toBe(false);
  });
});
