import { Inject, Injectable } from '@nestjs/common';
import { NightIcebreaker } from '@Huemans/NightIcebreaker/Domain/NightIcebreaker';
import { EVENT_DIRECTORY, EventDirectory } from '@Huemans/NightIcebreaker/Domain/Port/EventDirectory';
import { GROUP_DIRECTORY, GroupDirectory } from '@Huemans/NightIcebreaker/Domain/Port/GroupDirectory';
import { ICEBREAKER_CATALOG, IcebreakerCatalog } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerCatalog';
import { ICEBREAKER_EXPLAINER, IcebreakerExplainer } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerExplainer';
import {
  NIGHT_ICEBREAKER_REPOSITORY,
  NightIcebreakerRepository,
} from '@Huemans/NightIcebreaker/Domain/Port/NightIcebreakerRepository';
import {
  ROOM_TRAITS_REPOSITORY,
  RoomTraitsRepository,
} from '@Huemans/NightIcebreaker/Domain/Port/RoomTraitsRepository';
import { UnknownEvent } from '@Huemans/NightIcebreaker/Domain/UnknownEvent';
import { EVENT_DISPATCHER, EventDispatcher } from '@Huemans/Shared/Domain/Port/EventDispatcher';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { WeightedTrait, WeightedTraitPrimitives } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { AttendeeIcebreakerView, HostIcebreakerView } from './IcebreakerViews';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject(ROOM_TRAITS_REPOSITORY) private readonly rooms: RoomTraitsRepository,
    @Inject(NIGHT_ICEBREAKER_REPOSITORY) private readonly icebreakers: NightIcebreakerRepository,
    @Inject(ICEBREAKER_CATALOG) private readonly catalog: IcebreakerCatalog,
    @Inject(ICEBREAKER_EXPLAINER) private readonly explainer: IcebreakerExplainer,
    @Inject(EVENT_DIRECTORY) private readonly events: EventDirectory,
    @Inject(GROUP_DIRECTORY) private readonly groups: GroupDirectory,
    @Inject(EVENT_DISPATCHER) private readonly dispatcher: EventDispatcher,
  ) {}

  collect(eventId: string, attendeeId: string, traits: WeightedTraitPrimitives[]): Promise<void> {
    return this.rooms.add(
      new EventId(eventId),
      new AttendeeId(attendeeId),
      traits.map((trait) => WeightedTrait.fromPrimitives(trait)),
    );
  }

  /** Picks the event's icebreaker from its room; an event that already has one keeps it. */
  async pick(eventId: string): Promise<void> {
    const id = new EventId(eventId);
    if ((await this.icebreakers.search(id)) !== null) {
      return;
    }
    const room = await this.rooms.profileOf(id);
    const match = room.bestMatch(await this.catalog.candidates());
    const icebreaker = NightIcebreaker.pick(id, match, await this.explainer.explain(room, match), new Date());

    await this.icebreakers.save(icebreaker);
    await this.dispatcher.dispatchAll(icebreaker.pullDomainEvents());
  }

  async forHost(eventId: string): Promise<HostIcebreakerView> {
    const icebreaker = await this.icebreakerOf(new EventId(eventId));
    if (icebreaker === null) {
      return { status: 'locked' };
    }
    const { question, why, gatherEndsAt } = icebreaker.toDTO();
    return { status: 'ready', question, why, gatherEndsAt };
  }

  /** Locked until the event is revealed, and while the attendee has no group. */
  async forAttendee(eventId: string, attendeeId: string): Promise<AttendeeIcebreakerView> {
    const id = new EventId(eventId);
    const attendee = new AttendeeId(attendeeId);
    const icebreaker = await this.icebreakerOf(id);
    if (icebreaker === null) {
      return { status: 'locked' };
    }
    const color = await this.groups.colorOf(id, attendee);
    if (color === null) {
      return { status: 'locked' };
    }
    const { question, why, gatherEndsAt } = icebreaker.toDTO();
    return { status: 'ready', question, why, meetingSpot: icebreaker.meetingSpotFor(color).value, gatherEndsAt };
  }

  private async icebreakerOf(id: EventId): Promise<NightIcebreaker | null> {
    if (!(await this.events.exists(id))) {
      throw new UnknownEvent(id);
    }
    return this.icebreakers.search(id);
  }
}
