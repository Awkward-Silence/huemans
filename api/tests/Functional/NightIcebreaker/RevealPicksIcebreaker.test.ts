import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../../contracts/event';
import { SENTENCE_TRAIT_WEIGHER } from '@Huemans/Participation/Domain/Port/SentenceTraitWeigher';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { seedCatalogFiles } from '../../Support/catalog';
import { bootFunctional, getJson, postJson } from '../../Support/functional';
import { anAnswerOf, expectedIcebreakerFor } from '../../Support/room';

// Catalog suites briefly add icebreaker fixtures suiting humorous and curious, so these rooms avoid both traits.
const ROOM = ['adventurous', 'adventurous', 'competitive', 'analytical'];

describe('Revealing an event picks the night icebreaker', () => {
  let app: INestApplication;
  let eventId: string;

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
  });

  async function submit(trait: string, attendeeId = AttendeeId.random().value) {
    const response = await postJson(app, `/events/${eventId}/attendees/${attendeeId}/answers`, {
      answers: [anAnswerOf(trait)],
      sentence: null,
    });
    expect(response.status).toBe(200);
  }

  async function hostIcebreaker(): Promise<unknown> {
    return (await getJson(app, `/events/${eventId}/icebreaker`)).body;
  }

  async function reveal() {
    expect((await postJson(app, `/events/${eventId}/reveal`, {})).status).toBe(200);
  }

  it('testPickedIcebreakerMatchesTheRoom', async () => {
    for (const trait of ROOM) {
      await submit(trait);
    }

    await reveal();

    const icebreaker = await hostIcebreaker();
    expect(icebreaker).toMatchObject({ status: 'ready', question: expectedIcebreakerFor(ROOM).text });
  });

  it('testRepeatedSubmitCountsOnce', async () => {
    const attendee = AttendeeId.random().value;
    await submit('analytical', attendee);
    await submit('analytical', attendee);
    await submit('adventurous');

    await reveal();

    // With the repeat counted twice, analytical would outweigh adventurous.
    expect(await hostIcebreaker()).toMatchObject({
      question: expectedIcebreakerFor(['analytical', 'adventurous']).text,
    });
  });

  it('testSecondRevealAndLateSubmitKeepTheIcebreaker', async () => {
    await submit('adventurous');
    await reveal();
    const picked = await hostIcebreaker();

    for (const trait of ['analytical', 'analytical', 'analytical']) {
      await submit(trait);
    }
    await reveal();

    expect(await hostIcebreaker()).toEqual(picked);
  });

  it('testOpenEventIsLocked', async () => {
    await submit('adventurous');

    expect(await hostIcebreaker()).toEqual({ status: 'locked' });
  });
});
