import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('Trait', () => {
  it('testAcceptsACatalogTrait', () => {
    expect(new Trait('curious').value).toBe('curious');
  });

  it('testRejectsAValueOutsideTheList', () => {
    expect(() => new Trait('grumpy')).toThrow(InvalidArgumentError);
  });

  it('testListsThe33CatalogTraits', () => {
    expect(new Set(TRAITS).size).toBe(33);
  });
});
