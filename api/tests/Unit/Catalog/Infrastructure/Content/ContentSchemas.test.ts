import {
  PersonalityTypeProfileContent,
  PersonalityTypeProfileListSchema,
} from '@Huemans/Catalog/Infrastructure/Content/PersonalityTypeProfileList';
import { QuestionSchema } from '@Huemans/Catalog/Infrastructure/Content/QuestionList';
import {
  checkProfileChips,
  TraitTypeMappingContent,
  TraitTypeMappingContentSchema,
} from '@Huemans/Catalog/Infrastructure/Content/TraitTypeMappingContent';
import { PERSONALITY_TYPES } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Inline content; the real tools/ files are checked by the seed functional test.
describe('Catalog content schemas', () => {
  let mapping: TraitTypeMappingContent;
  let profiles: PersonalityTypeProfileContent[];

  beforeEach(() => {
    mapping = Object.fromEntries(
      TRAITS.map((trait, index) => [trait, PERSONALITY_TYPES[index % PERSONALITY_TYPES.length]]),
    ) as TraitTypeMappingContent;
    profiles = PERSONALITY_TYPES.map((type) => ({
      type,
      nickname: `The ${type}s`,
      blurb: `About the ${type}s`,
      traits: TRAITS.filter((trait) => mapping[trait] === type).slice(0, 3),
    }));
  });

  it('testAcceptsConsistentProfilesAndMapping', () => {
    expect(PersonalityTypeProfileListSchema.safeParse(profiles).success).toBe(true);
    expect(TraitTypeMappingContentSchema.safeParse(mapping).success).toBe(true);
    expect(checkProfileChips(profiles, mapping)).toEqual([]);
  });

  it('testRejectsAMissingProfile', () => {
    const result = PersonalityTypeProfileListSchema.safeParse(profiles.filter((profile) => profile.type !== 'dreamer'));

    expect(result.success).toBe(false);
  });

  it('testRejectsAnUnmappedTrait', () => {
    const withoutHonest = Object.fromEntries(Object.entries(mapping).filter(([trait]) => trait !== 'honest'));

    expect(TraitTypeMappingContentSchema.safeParse(withoutHonest).success).toBe(false);
  });

  it('testRejectsARepeatedAnswerId', () => {
    const answer = { id: 'q0001-a', text: 'Answer', trait: 'curious' };
    const question = { id: 'q0001', theme: 'home', text: 'Question', answers: [answer, answer, answer, answer] };

    expect(QuestionSchema.safeParse(question).success).toBe(false);
  });

  it('testReportsAChipMappedToAnotherType', () => {
    const explorerTrait = TRAITS.find((trait) => mapping[trait] === 'explorer')!;
    const planner = profiles.find((profile) => profile.type === 'planner')!;
    const withExplorerChip = [{ ...planner, traits: [explorerTrait, ...planner.traits.slice(1)] }];

    expect(checkProfileChips(withExplorerChip, mapping)).toEqual([
      `planner chip ${explorerTrait} is mapped to explorer`,
    ]);
  });
});
