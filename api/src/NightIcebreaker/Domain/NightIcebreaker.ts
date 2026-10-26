import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { NightIcebreakerPicked } from './NightIcebreakerPicked';
import { NightIcebreakerView } from './NightIcebreakerView';
import { IcebreakerCandidate } from './ValueObject/IcebreakerCandidate';
import { IcebreakerId } from './ValueObject/IcebreakerId';
import { IcebreakerQuestion } from './ValueObject/IcebreakerQuestion';
import { IcebreakerReason } from './ValueObject/IcebreakerReason';
import { MeetingSpot } from './ValueObject/MeetingSpot';

const GATHERING_MS = 120_000;

/** The one icebreaker of an event's night, picked at the reveal and never changed. */
export class NightIcebreaker extends AggregateRoot {
  private constructor(
    readonly eventId: EventId,
    readonly icebreakerId: IcebreakerId,
    readonly question: IcebreakerQuestion,
    readonly why: IcebreakerReason,
    readonly pickedAt: Date,
  ) {
    super();
  }

  static pick(eventId: EventId, match: IcebreakerCandidate, why: IcebreakerReason, pickedAt: Date): NightIcebreaker {
    const icebreaker = new NightIcebreaker(eventId, match.id, match.question, why, pickedAt);
    icebreaker.record(new NightIcebreakerPicked(eventId.value, match.id.value));

    return icebreaker;
  }

  meetingSpotFor(color: Color): MeetingSpot {
    return MeetingSpot.for(color);
  }

  toDTO(): NightIcebreakerView {
    return {
      eventId: this.eventId.value,
      icebreakerId: this.icebreakerId.value,
      question: this.question.value,
      why: this.why.value,
      pickedAt: this.pickedAt.toISOString(),
      gatherEndsAt: new Date(this.pickedAt.getTime() + GATHERING_MS).toISOString(),
    };
  }
}
