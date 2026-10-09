import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

class Nickname extends StringValueObject {}

class NicknameCollection extends Collection<Nickname> {
  protected type(): new (...args: never[]) => Nickname {
    return Nickname;
  }
}

describe('Collection', () => {
  let ana: Nickname;
  let bea: Nickname;

  beforeEach(() => {
    ana = new Nickname('ana');
    bea = new Nickname('bea');
  });

  it('testHoldsItemsInOrder', () => {
    const nicknames = new NicknameCollection([ana, bea]);

    expect(nicknames.count()).toBe(2);
    expect([...nicknames]).toEqual([ana, bea]);
  });

  it('testRejectsItemOfAnotherType', () => {
    expect(() => new NicknameCollection([ana, 'bea' as unknown as Nickname])).toThrow(InvalidArgumentError);
  });

  it('testCannotBeChangedThroughTheArrayItWasBuiltFrom', () => {
    const items = [ana];
    const nicknames = new NicknameCollection(items);

    items.push(bea);

    expect(nicknames.count()).toBe(1);
  });

  it('testAllReturnsACopy', () => {
    const nicknames = new NicknameCollection([ana]);

    (nicknames.all() as Nickname[]).push(bea);

    expect(nicknames.count()).toBe(1);
  });
});
