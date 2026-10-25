import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../contracts/event';
import type { SubmitAnswersResponse } from '../../../contracts/participation';
import type { EventDistributionView } from '../../../contracts/colorDistribution';
import { SENTENCE_TRAIT_WEIGHER } from '@Huemans/Participation/Domain/Port/SentenceTraitWeigher';
import { SentenceAnswer } from '@Huemans/Participation/Domain/ValueObject/SentenceAnswer';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { realContent, seedCatalogFiles } from '../../Support/catalog';
import { bootFunctional, getJson, joinAttendee, postJson } from '../../Support/functional';

const SENTENCE = { question: 'Finish the sentence: I ...', answer: 'I secretly write love letters to my toaster' };

type Choice = { questionId: string; answerId: string };

/** Answers from the seeded catalog whose trait maps to `type`, one per question. */
function answersOfType(type: PersonalityTypeValue, count: number): Choice[] {
  const { questions, mapping } = realContent();
  return questions
    .flatMap((question) => {
      const answer = question.answers.find((candidate) => mapping[candidate.trait] === type);
      return answer === undefined ? [] : [{ questionId: question.id, answerId: answer.id }];
    })
    .slice(0, count);
}

function aTraitOfType(type: PersonalityTypeValue): TraitValue {
  const { mapping } = realContent();
  return (Object.keys(mapping) as TraitValue[]).find((trait) => mapping[trait] === type)!;
}

describe('POST /events/:eventId/attendees/:attendeeId/answers', () => {
  let app: INestApplication;
  let weigh: jest.Mock<Promise<SentenceTraits>, [SentenceAnswer]>;
  let eventId: string;
  let attendeeId: string;

  beforeAll(async () => {
    weigh = jest.fn<Promise<SentenceTraits>, [SentenceAnswer]>();
    app = await bootFunctional({ overrides: [{ provide: SENTENCE_TRAIT_WEIGHER, useValue: { weigh } }] });
    await seedCatalogFiles(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    weigh.mockReset().mockResolvedValue(SentenceTraits.none());
    eventId = ((await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse).id;
    attendeeId = await joinAttendee(app, eventId);
  });

  function submit(body: object, attendee = attendeeId, event = eventId) {
    return postJson(app, `/events/${event}/attendees/${attendee}/answers`, body);
  }

  it('testReturnsTheColorFromTheMultipleChoiceAnswers', async () => {
    const response = await submit({
      answers: [...answersOfType('explorer', 2), ...answersOfType('connector', 1)],
      elapsedMs: 31_000,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'assigned', color: 'amber', personalityType: 'explorer' });
    expect(weigh).not.toHaveBeenCalled();
    const assignment = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);
    expect(assignment.body).toMatchObject({ status: 'assigned', color: 'amber', personalityType: 'explorer' });
  });

  it('testTheSentenceTipsATiedAttendee', async () => {
    weigh.mockResolvedValue(SentenceTraits.fromScores([[new Trait(aTraitOfType('dreamer')), 1]]));

    const response = await submit({
      // One connector and one dreamer answer: without the sentence the tie goes to connector.
      answers: [...answersOfType('connector', 1), ...answersOfType('dreamer', 1)],
      sentence: SENTENCE,
    });

    expect((response.body as SubmitAnswersResponse).personalityType).toBe('dreamer');
    expect(weigh).toHaveBeenCalledWith(expect.objectContaining(SENTENCE));
  });

  it('testAssignsEvenWhenNothingPointsToATrait', async () => {
    const response = await submit({ answers: [{ questionId: 'q9999', answerId: 'q9999-z' }], sentence: SENTENCE });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'assigned', color: 'amber', personalityType: 'explorer' });
  });

  it('testRepeatedSubmissionReturnsTheFirstGroupWithoutWeighingAgain', async () => {
    const first = await submit({ answers: answersOfType('planner', 1) });
    weigh.mockResolvedValue(SentenceTraits.fromScores([[new Trait(aTraitOfType('dreamer')), 1]]));

    const second = await submit({ answers: answersOfType('dreamer', 2), sentence: SENTENCE });

    expect(second.body).toEqual(first.body);
    expect(second.body).toMatchObject({ personalityType: 'planner' });
    expect(weigh).not.toHaveBeenCalled();
  });

  it('testUnknownEventIsNotFound', async () => {
    const response = await submit({ answers: [] }, attendeeId, EventId.random().value);

    expect(response.status).toBe(404);
  });

  it('testAnAttendeeWhoNeverJoinedIsNotFoundAndNotGrouped', async () => {
    const response = await submit({ answers: answersOfType('planner', 1) }, AttendeeId.random().value);

    expect(response.status).toBe(404);
    const distribution = (await getJson(app, `/events/${eventId}/distribution`)).body as EventDistributionView;
    expect(distribution.groups.reduce((sum, group) => sum + group.members, 0)).toBe(0);
  });

  it('testAnAttendeeOfAnotherEventIsNotFound', async () => {
    const otherEvent = ((await postJson(app, '/events', { name: 'Other night' })).body as EventResponse).id;

    const response = await submit({ answers: [] }, attendeeId, otherEvent);

    expect(response.status).toBe(404);
  });

  it.each([
    [{}],
    [{ answers: 'q0001-a' }],
    [{ answers: [], sentence: { question: 'Finish it' } }],
    [{ answers: [], sentence: { question: 'Finish it', answer: '   ' } }],
  ])('testRejectsAMalformedSubmission %#', async (body) => {
    const response = await submit(body);

    expect(response.status).toBe(400);
  });
});
