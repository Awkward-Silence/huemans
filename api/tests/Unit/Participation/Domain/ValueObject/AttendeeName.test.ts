import { AttendeeName } from '@Huemans/Participation/Domain/ValueObject/AttendeeName';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('AttendeeName', () => {
  it('testTrimsTheName', () => {
    expect(new AttendeeName('  Ana ').value).toBe('Ana');
  });

  it('testAcceptsFortyCharacters', () => {
    expect(new AttendeeName('a'.repeat(40)).value).toHaveLength(40);
  });

  it.each([[''], ['   '], ['a'.repeat(41)]])('testRejectsTheName %p', (name) => {
    expect(() => new AttendeeName(name)).toThrow(InvalidArgumentError);
  });

  it('testRejectsSomethingThatIsNotText', () => {
    expect(() => new AttendeeName(undefined as unknown as string)).toThrow(InvalidArgumentError);
  });
});
