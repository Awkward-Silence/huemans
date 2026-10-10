import { INestApplication } from '@nestjs/common';
import type { EventDistributionView } from '../../../../contracts/colorDistribution';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { wholeAnswers } from '../../Support/traits';
import { publish } from '../../Support/events';
import { seedCatalogFiles } from '../../Support/catalog';
import { bootFunctional, getJson } from '../../Support/functional';

describe('GET /events/:eventId/distribution', () => {
  let app: INestApplication;
  let eventId: string;

  beforeAll(async () => {
    app = await bootFunctional();
    await seedCatalogFiles(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    eventId = EventId.random().value;
    await publish(app, new EventCreated(eventId));
  });

  it('testNewEventHasFourEmptyGroups', async () => {
    const response = await getJson(app, `/events/${eventId}/distribution`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      eventId,
      groups: [
        { color: 'amber', members: 0, personalityTypes: [] },
        { color: 'coral', members: 0, personalityTypes: [] },
        { color: 'teal', members: 0, personalityTypes: [] },
        { color: 'violet', members: 0, personalityTypes: [] },
      ],
    } satisfies EventDistributionView);
  });

  it('testDistributionReflectsAssignments', async () => {
    await publish(
      app,
      new QuestionnaireCompleted(
        AttendeeId.random().value,
        eventId,
        wholeAnswers('curious', 'adventurous', 'organized'),
      ),
      new QuestionnaireCompleted(AttendeeId.random().value, eventId, wholeAnswers('sociable')),
      new QuestionnaireCompleted(
        AttendeeId.random().value,
        eventId,
        wholeAnswers('organized', 'organized', 'sociable'),
      ),
    );

    const response = await getJson(app, `/events/${eventId}/distribution`);

    expect(response.status).toBe(200);
    expect((response.body as EventDistributionView).groups).toEqual([
      { color: 'amber', members: 1, personalityTypes: ['explorer'] },
      { color: 'coral', members: 1, personalityTypes: ['connector'] },
      { color: 'teal', members: 1, personalityTypes: ['planner'] },
      { color: 'violet', members: 0, personalityTypes: [] },
    ]);
  });

  it('testUnknownEventIsNotFound', async () => {
    const response = await getJson(app, `/events/${EventId.random().value}/distribution`);

    expect(response.status).toBe(404);
  });

  it('testInvalidEventIdIsBadRequest', async () => {
    const response = await getJson(app, '/events/3b241101-e2bb-4255-8caf-4136c566a962/distribution');

    expect(response.status).toBe(400);
  });
});
