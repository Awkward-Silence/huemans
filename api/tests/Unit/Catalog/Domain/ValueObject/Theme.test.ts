import { Theme, THEMES } from '@Huemans/Catalog/Domain/ValueObject/Theme';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('Theme', () => {
  it('testAcceptsACatalogTheme', () => {
    expect(new Theme('food').value).toBe('food');
  });

  it('testRejectsAValueOutsideTheList', () => {
    expect(() => new Theme('politics')).toThrow(InvalidArgumentError);
  });

  it('testListsThe20CatalogThemes', () => {
    expect(new Set(THEMES).size).toBe(20);
  });
});
