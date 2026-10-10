import { INestApplication } from '@nestjs/common';
import type { AttendeeAssignment, AttendeePending } from '../../../../contracts/colorDistribution';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { PersonalityTypesNotDefined } from '@Huemans/Catalog/Domain/PersonalityTypesNotDefined';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { wholeAnswers } from '../../Support/traits';
import { publish } from '../../Support/events';
import { realContent, seedCatalogFiles } from '../../Support/catalog';
import { bootFunctional, getJson } from '../../Support/functional';

describe('GET /events/:eventId/attendees/:attendeeId/assignment', () => {
  let app: INestApplication;
  let eventId: string;
  let attendeeId: string;

  beforeAll(async () => {
    app = await bootFunctional();
    await seedCatalogFiles(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    eventId = EventId.random().value;
    attendeeId = AttendeeId.random().value;
    await publish(app, new EventCreated(eventId));
  });

  it('testAssignedAttendeeReadsTheirGroup', async () => {
    const dreamer = realContent().profiles.find((profile) => profile.type === 'dreamer')!;
    await publish(
      app,
      new QuestionnaireCompleted(attendeeId, eventId, wholeAnswers('romantic', 'nostalgic', 'sociable')),
    );

    const response = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'assigned',
      eventId,
      attendeeId,
      color: 'amber',
      personalityType: 'dreamer',
      // The reveal copy is the catalog's dreamer profile.
      nickname: dreamer.nickname,
      blurb: dreamer.blurb,
      traits: dreamer.traits,
      mates: 0,
      reason: { lean: [], text: expect.stringContaining('amber') as string },
    } satisfies AttendeeAssignment);
  });

  it('testPersonalityTypeComesFromTheCatalogMapping', async () => {
    const planner = Object.entries(realContent().mapping)
      .filter(([, type]) => type === 'planner')
      .map(([trait]) => trait);
    await publish(app, new QuestionnaireCompleted(attendeeId, eventId, wholeAnswers(...planner.slice(0, 4))));

    const response = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);

    expect(response.body).toMatchObject({ status: 'assigned', personalityType: 'planner' });
  });

  it('testAttendeeNotAssignedYet', async () => {
    const response = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'pending' } satisfies AttendeePending);
  });

  it('testUnknownEventIsNotFound', async () => {
    const response = await getJson(app, `/events/${EventId.random().value}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: expect.stringContaining('has no distribution') as string,
    });
  });

  it('testInvalidAttendeeIdIsBadRequest', async () => {
    const response = await getJson(app, `/events/${eventId}/attendees/not-a-uuid/assignment`);

    expect(response.status).toBe(400);
  });
});

describe('GET /events/:eventId/attendees/:attendeeId/assignment without catalog profiles', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { mapping } = realContent();
    app = await bootFunctional({
      overrides: [
        {
          provide: CatalogService,
          useValue: {
            mapping: () => Promise.resolve(mapping),
            profileOf: () => Promise.reject(new PersonalityTypesNotDefined()),
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('testUnseededCatalogIsAServerErrorNotAnUnknownEvent', async () => {
    const eventId = EventId.random().value;
    const attendeeId = AttendeeId.random().value;
    await publish(app, new EventCreated(eventId));
    await publish(
      app,
      new QuestionnaireCompleted(attendeeId, eventId, wholeAnswers('romantic', 'nostalgic', 'sociable')),
    );

    const response = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(500);
  });
});
