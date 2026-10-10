import { IcebreakerAuthored } from '@Huemans/Catalog/Domain/Event/IcebreakerAuthored';
import { PersonalityTypesDefined } from '@Huemans/Catalog/Domain/Event/PersonalityTypesDefined';
import { QuestionAuthored } from '@Huemans/Catalog/Domain/Event/QuestionAuthored';

describe('Catalog events', () => {
  it('testQuestionAuthoredCarriesTheQuestionId', () => {
    const event = new QuestionAuthored('q0001');

    expect(event.eventName).toBe('catalog.question_authored');
    expect(event.aggregateId).toBe('q0001');
    expect(event.toPrimitives()).toEqual({ questionId: 'q0001' });
  });

  it('testIcebreakerAuthoredCarriesTheIcebreakerId', () => {
    const event = new IcebreakerAuthored('i0001');

    expect(event.eventName).toBe('catalog.icebreaker_authored');
    expect(event.aggregateId).toBe('i0001');
    expect(event.toPrimitives()).toEqual({ icebreakerId: 'i0001' });
  });

  it('testPersonalityTypesDefinedUsesTheSingletonId', () => {
    const event = new PersonalityTypesDefined();

    expect(event.eventName).toBe('catalog.personality_types_defined');
    expect(event.aggregateId).toBe('personality-types');
    expect(event.toPrimitives()).toEqual({});
  });
});
