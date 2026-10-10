import { readFileSync } from 'node:fs';
import { PersonalityTypeProfileListSchema } from '@Huemans/Catalog/Infrastructure/Content/PersonalityTypeProfileList';
import { QuestionSchema } from '@Huemans/Catalog/Infrastructure/Content/QuestionList';
import {
  checkProfileChips,
  TraitTypeMappingContentSchema,
} from '@Huemans/Catalog/Infrastructure/Content/TraitTypeMappingContent';

const profiles = PersonalityTypeProfileListSchema.parse(
  JSON.parse(readFileSync('../tools/src/personality-types/profiles.json', 'utf8')),
);
const mapping = TraitTypeMappingContentSchema.parse(
  JSON.parse(readFileSync('../tools/src/personality-types/trait-types.json', 'utf8')),
);

describe('Catalog content schemas', () => {
  it('testCurrentProfilesAndMappingAreConsistent', () => {
    expect(profiles).toHaveLength(4);
    expect(Object.keys(mapping)).toHaveLength(33);
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
    const planner = profiles.find((profile) => profile.type === 'planner')!;
    const withCurious = [{ ...planner, traits: ['curious', 'organized', 'practical'] as typeof planner.traits }];

    expect(checkProfileChips(withCurious, mapping)).toEqual(['planner chip curious is mapped to explorer']);
  });
});
