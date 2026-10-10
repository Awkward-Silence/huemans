import { IcebreakerAuthored } from '@Huemans/Catalog/Domain/Event/IcebreakerAuthored';
import { Icebreaker } from '@Huemans/Catalog/Domain/Icebreaker';
import { IcebreakerId } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerId';
import { IcebreakerText } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerText';
import { IcebreakerTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerTraitCollection';
import { Theme } from '@Huemans/Catalog/Domain/ValueObject/Theme';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('Icebreaker', () => {
  let id: IcebreakerId;
  let theme: Theme;
  let text: IcebreakerText;
  let traits: IcebreakerTraitCollection;

  beforeEach(() => {
    id = new IcebreakerId('i0001');
    theme = new Theme('food');
    text = new IcebreakerText('What is the only dish on your menu?');
    traits = new IcebreakerTraitCollection([new Trait('creative'), new Trait('nostalgic')]);
  });

  it('testAuthoringRecordsIcebreakerAuthoredOnce', () => {
    const icebreaker = Icebreaker.author(id, theme, text, traits);

    const events = icebreaker.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(IcebreakerAuthored);
    expect(events[0].aggregateId).toBe('i0001');
  });

  it('testRebuildingRecordsNothing', () => {
    expect(Icebreaker.rebuild(id, theme, text, traits).pullDomainEvents()).toEqual([]);
  });

  it('testToDTOKeepsTheContract', () => {
    expect(Icebreaker.rebuild(id, theme, text, traits).toDTO()).toEqual({
      id: 'i0001',
      theme: 'food',
      text: 'What is the only dish on your menu?',
      traits: ['creative', 'nostalgic'],
    });
  });
});
