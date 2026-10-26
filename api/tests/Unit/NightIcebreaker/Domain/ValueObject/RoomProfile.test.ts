import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';
import { RoomProfile } from '@Huemans/NightIcebreaker/Domain/ValueObject/RoomProfile';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';

function candidate(id: string, ...traits: string[]): IcebreakerCandidate {
  return IcebreakerCandidate.fromPrimitives({ id, text: `Question ${id}?`, traits });
}

function room(...traits: [string, number][]): RoomProfile {
  return new RoomProfile(traits.map(([trait, weight]) => WeightedTrait.fromPrimitives({ trait, weight })));
}

describe('RoomProfile', () => {
  let candidates: IcebreakerCandidate[];

  beforeEach(() => {
    candidates = [
      candidate('i0001', 'creative', 'nostalgic'),
      candidate('i0002', 'adventurous', 'humorous'),
      candidate('i0003', 'analytical'),
    ];
  });

  it('testSumsTheWeightOfEachTraitOverTheRoom', () => {
    const profile = room(['curious', 1], ['curious', 0.5], ['analytical', 1]);

    expect(profile.weightOf(new Trait('curious'))).toBe(1.5);
    expect(profile.weightOf(new Trait('analytical'))).toBe(1);
    expect(profile.weightOf(new Trait('creative'))).toBe(0);
  });

  it('testBestMatchHasTheHighestSummedWeightOfItsTraits', () => {
    const profile = room(['adventurous', 1], ['humorous', 1], ['analytical', 1], ['analytical', 0.5]);

    expect(profile.bestMatch(candidates).id.value).toBe('i0002');
  });

  it('testTieGoesToTheLowestId', () => {
    const profile = room(['nostalgic', 1], ['analytical', 1]);

    expect(profile.bestMatch([candidates[2], candidates[0]]).id.value).toBe('i0001');
  });

  it('testEmptyRoomPicksTheLowestId', () => {
    expect(room().bestMatch([candidates[1], candidates[0]]).id.value).toBe('i0001');
  });

  it('testStrongestTraitsAreTheRoomsHeaviestFirstLeavingOutAbsentOnes', () => {
    const profile = room(['humorous', 1], ['adventurous', 0.5], ['humorous', 1]);

    expect(profile.strongestOf(candidates[1].traits).map((trait) => trait.value)).toEqual(['humorous', 'adventurous']);
    expect(profile.strongestOf(candidates[0].traits)).toEqual([]);
  });

  it('testNoCandidatesIsAnError', () => {
    expect(() => room().bestMatch([])).toThrow();
  });
});
