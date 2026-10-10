import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Assignment } from './Assignment';
import { AttendeeAlreadyAssigned } from './AttendeeAlreadyAssigned';
import { AttendeeGrouped } from './AttendeeGrouped';
import { EventDistributionView } from './EventDistributionView';
import { AssignmentCollection } from './AssignmentCollection';
import { Color, COLORS } from '@Huemans/Shared/Domain/ValueObject/Color';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TraitProfile } from './ValueObject/TraitProfile';
import { TraitTypeMapping } from './ValueObject/TraitTypeMapping';

export class EventDistribution extends AggregateRoot {
  private constructor(
    readonly eventId: EventId,
    private grouped: AssignmentCollection,
  ) {
    super();
  }

  static open(eventId: EventId): EventDistribution {
    return new EventDistribution(eventId, new AssignmentCollection([]));
  }

  assign(attendeeId: AttendeeId, traits: TraitProfile, mapping: TraitTypeMapping): void {
    if (this.grouped.has(attendeeId)) {
      throw new AttendeeAlreadyAssigned(this.eventId, attendeeId);
    }
    const { color, type } = this.mostDiversePlacement(traits.candidateTypes(mapping));
    this.grouped = this.grouped.with(new Assignment(this.eventId, attendeeId, color, type, new Date()));
    this.record(new AttendeeGrouped(this.eventId, attendeeId, color, type));
  }

  assignments(): readonly Assignment[] {
    return this.grouped.all();
  }

  // Among the smallest groups, the (group, type) pair where that type is least represented.
  // Strict comparison keeps the first pair on ties: color order first, then candidate type order.
  private mostDiversePlacement(candidateTypes: PersonalityType[]): { color: Color; type: PersonalityType } {
    const colors = COLORS.map((value) => new Color(value));
    const smallest = Math.min(...colors.map((color) => this.grouped.membersOf(color).length));
    let best: { color: Color; type: PersonalityType; score: number } | undefined;
    for (const color of colors.filter((color) => this.grouped.membersOf(color).length === smallest)) {
      for (const type of candidateTypes) {
        const score = this.grouped.countOf(color, type);
        if (best === undefined || score < best.score) {
          best = { color, type, score };
        }
      }
    }

    return best!;
  }

  toDTO(): EventDistributionView {
    return {
      eventId: this.eventId.value,
      groups: COLORS.map((value) => {
        const members = this.grouped.membersOf(new Color(value));
        return {
          color: value,
          members: members.length,
          personalityTypes: members.map((member) => member.personalityType.value),
        };
      }),
    };
  }
}
