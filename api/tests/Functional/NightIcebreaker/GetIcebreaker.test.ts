import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../contracts/event';
import type { SubmitAnswersResponse } from '../../../contracts/participation';
import type { AttendeeIcebreakerResponse, HostIcebreakerResponse } from '../../../contracts/nightIcebreaker';
import { SENTENCE_TRAIT_WEIGHER } from '@Huemans/Participation/Domain/Port/SentenceTraitWeigher';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { seedCatalogFiles } from '../../Support/catalog';
import { bootFunctional, getJson, joinAttendee, postJson } from '../../Support/functional';
import { anAnswerOf } from '../../Support/room';

const MEETING_SPOTS = { amber: 'the bar', coral: 'the entrance', teal: 'the stage', violet: 'the back corner' };

describe('GET icebreaker', () => {
  let app: INestApplication;
  let eventId: string;
  let attendeeId: string;

  beforeAll(async () => {
    app = await bootFunctional({
      overrides: [
        { provide: SENTENCE_TRAIT_WEIGHER, useValue: { weigh: () => Promise.resolve(SentenceTraits.none()) } },
      ],
    });
    await seedCatalogFiles(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    eventId = ((await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse).id;
    attendeeId = await joinAttendee(app, eventId);
  });

  async function submit(attendee = attendeeId): Promise<SubmitAnswersResponse> {
    const response = await postJson(app, `/events/${eventId}/attendees/${attendee}/answers`, {
      answers: [anAnswerOf('adventurous')],
      sentence: null,
    });
    return response.body as SubmitAnswersResponse;
  }

  async function reveal(): Promise<number> {
    const before = Date.now();
    await postJson(app, `/events/${eventId}/reveal`, {});
    return before;
  }

  function attendeeIcebreaker(attendee = attendeeId) {
    return getJson(app, `/events/${eventId}/attendees/${attendee}/icebreaker`);
  }

  describe('/events/:eventId/attendees/:attendeeId/icebreaker', () => {
    it('testLockedBeforeTheReveal', async () => {
      await submit();

      const response = await attendeeIcebreaker();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'locked' });
    });

    it('testReadyAfterTheReveal', async () => {
      const { color } = await submit();
      const revealedFrom = await reveal();

      const response = await attendeeIcebreaker();

      expect(response.status).toBe(200);
      const body = response.body as Extract<AttendeeIcebreakerResponse, { status: 'ready' }>;
      expect(body.status).toBe('ready');
      expect(body.question).not.toBe('');
      expect(body.why).toBe('Picked for a room that leans adventurous.');
      expect(body.meetingSpot).toBe(MEETING_SPOTS[color]);
      const gatherEndsAt = Date.parse(body.gatherEndsAt);
      expect(body.gatherEndsAt).toBe(new Date(gatherEndsAt).toISOString());
      expect(gatherEndsAt).toBeGreaterThanOrEqual(revealedFrom + 120_000);
      expect(gatherEndsAt).toBeLessThanOrEqual(Date.now() + 120_000);
    });

    it('testEveryAttendeeGetsTheSameIcebreakerAndTheirOwnSpot', async () => {
      const other = await joinAttendee(app, eventId);
      const mine = await submit();
      const theirs = await submit(other);
      await reveal();

      const [first, second] = await Promise.all([attendeeIcebreaker(), attendeeIcebreaker(other)]);

      const a = first.body as Extract<AttendeeIcebreakerResponse, { status: 'ready' }>;
      const b = second.body as Extract<AttendeeIcebreakerResponse, { status: 'ready' }>;
      expect(mine.color).not.toBe(theirs.color);
      expect(b.question).toBe(a.question);
      expect(b.why).toBe(a.why);
      expect(b.gatherEndsAt).toBe(a.gatherEndsAt);
      expect(a.meetingSpot).toBe(MEETING_SPOTS[mine.color]);
      expect(b.meetingSpot).toBe(MEETING_SPOTS[theirs.color]);
    });

    it('testLockedForAnAttendeeWithoutAGroup', async () => {
      await reveal();

      expect((await attendeeIcebreaker()).body).toEqual({ status: 'locked' });
    });

    it('testLateJoinerGetsItOnceGrouped', async () => {
      await submit(await joinAttendee(app, eventId));
      await reveal();
      const host = (await getJson(app, `/events/${eventId}/icebreaker`)).body as HostIcebreakerResponse;

      await submit();

      expect((await attendeeIcebreaker()).body).toMatchObject({ ...host, status: 'ready' });
    });

    it('testUnknownEventIsNotFound', async () => {
      eventId = EventId.random().value;

      expect((await attendeeIcebreaker()).status).toBe(404);
    });

    it('testMalformedIdsAreBadRequest', async () => {
      expect((await attendeeIcebreaker('not-a-uuid')).status).toBe(400);
      expect((await getJson(app, `/events/not-a-uuid/attendees/${attendeeId}/icebreaker`)).status).toBe(400);
    });
  });

  describe('/events/:eventId/icebreaker', () => {
    it('testLockedBeforeTheReveal', async () => {
      const response = await getJson(app, `/events/${eventId}/icebreaker`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'locked' });
    });

    it('testSameIcebreakerAsAttendees', async () => {
      await submit();
      await reveal();

      const host = (await getJson(app, `/events/${eventId}/icebreaker`)).body as HostIcebreakerResponse;
      const { question, why, gatherEndsAt } = (await attendeeIcebreaker()).body as Extract<
        AttendeeIcebreakerResponse,
        { status: 'ready' }
      >;

      expect(host).toEqual({ status: 'ready', question, why, gatherEndsAt });
    });

    it('testUnknownEventIsNotFound', async () => {
      expect((await getJson(app, `/events/${EventId.random().value}/icebreaker`)).status).toBe(404);
    });

    it('testMalformedIdIsBadRequest', async () => {
      expect((await getJson(app, '/events/not-a-uuid/icebreaker')).status).toBe(400);
    });
  });
});
