import { NightIcebreaker } from '@Huemans/NightIcebreaker/Domain/NightIcebreaker';
import { NightIcebreakerPicked } from '@Huemans/NightIcebreaker/Domain/NightIcebreakerPicked';
import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';
import { IcebreakerReason } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerReason';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

describe('NightIcebreaker', () => {
  let eventId: EventId;
  let pickedAt: Date;
  let icebreaker: NightIcebreaker;

  beforeEach(() => {
    eventId = EventId.random();
    pickedAt = new Date('2026-10-25T21:00:00.000Z');
    icebreaker = NightIcebreaker.pick(
      eventId,
      IcebreakerCandidate.fromPrimitives({
        id: 'i0002',
        text: 'What would you cook on the Moon?',
        traits: ['curious'],
      }),
      new IcebreakerReason('Picked for a room that leans curious.'),
      pickedAt,
    );
  });

  it('testPickingRecordsNightIcebreakerPickedOnce', () => {
    const events = icebreaker.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(NightIcebreakerPicked);
    expect(events[0].toPrimitives()).toEqual({ eventId: eventId.value, icebreakerId: 'i0002' });
    expect(icebreaker.pullDomainEvents()).toHaveLength(0);
  });

  it('testGatheringEndsTwoMinutesAfterThePick', () => {
    expect(icebreaker.toDTO().gatherEndsAt).toBe('2026-10-25T21:02:00.000Z');
  });

  it('testViewHoldsTheQuestionAndWhy', () => {
    expect(icebreaker.toDTO()).toEqual({
      eventId: eventId.value,
      icebreakerId: 'i0002',
      question: 'What would you cook on the Moon?',
      why: 'Picked for a room that leans curious.',
      pickedAt: '2026-10-25T21:00:00.000Z',
      gatherEndsAt: '2026-10-25T21:02:00.000Z',
    });
  });

  it('testMeetingSpotDependsOnTheColor', () => {
    expect(icebreaker.meetingSpotFor(new Color('teal')).value).toBe('the stage');
  });
});
