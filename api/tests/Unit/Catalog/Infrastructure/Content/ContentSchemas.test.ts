import { IcebreakerListSchema } from '@Huemans/Catalog/Infrastructure/Content/IcebreakerList';
import { PersonalityTypeProfileListSchema } from '@Huemans/Catalog/Infrastructure/Content/PersonalityTypeProfileList';
import { QuestionListSchema } from '@Huemans/Catalog/Infrastructure/Content/QuestionList';
import { TraitTypeMappingContentSchema } from '@Huemans/Catalog/Infrastructure/Content/TraitTypeMappingContent';

// The schemas only check the shape of the JSON; every content rule belongs to the Catalog aggregates.
describe('Catalog content schemas', () => {
  let question: { id: string; theme: string; text: string; answers: { id: string; text: string; trait: string }[] };

  beforeEach(() => {
    question = {
      id: 'q0001',
      theme: 'home',
      text: 'Question',
      answers: [{ id: 'q0001-a', text: 'Answer', trait: 'curious' }],
    };
  });

  it('testAcceptsWellShapedContentEvenWhenItBreaksAContentRule', () => {
    // One answer instead of 4 and an unknown theme: the aggregates reject these, not the schema.
    expect(QuestionListSchema.safeParse([{ ...question, theme: 'nowhere' }]).success).toBe(true);
    expect(
      IcebreakerListSchema.safeParse([{ id: 'i0001', theme: 'food', text: 'Icebreaker', traits: [] }]).success,
    ).toBe(true);
    expect(
      PersonalityTypeProfileListSchema.safeParse([{ type: 'planner', nickname: ' ', blurb: 'Blurb', traits: ['x'] }])
        .success,
    ).toBe(true);
    expect(TraitTypeMappingContentSchema.safeParse({ curious: 'planner' }).success).toBe(true);
  });

  it('testRejectsAFieldOfTheWrongType', () => {
    expect(QuestionListSchema.safeParse([{ ...question, text: 42 }]).success).toBe(false);
    expect(QuestionListSchema.safeParse([{ ...question, answers: 'none' }]).success).toBe(false);
    expect(TraitTypeMappingContentSchema.safeParse(['curious']).success).toBe(false);
  });
});
