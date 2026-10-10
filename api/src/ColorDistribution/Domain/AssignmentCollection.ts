import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { Assignment } from './Assignment';
import { Color } from './ValueObject/Color';
import { PersonalityType } from './ValueObject/PersonalityType';

export class AssignmentCollection extends Collection<Assignment> {
  constructor(assignments: readonly Assignment[]) {
    super(assignments);
    const attendees = new Set(assignments.map((assignment) => assignment.attendeeId.value));
    if (attendees.size !== assignments.length) {
      throw new InvalidArgumentError('<AssignmentCollection> does not allow two assignments for one attendee');
    }
  }

  protected type(): typeof Assignment {
    return Assignment;
  }

  has(attendeeId: AttendeeId): boolean {
    return this.all().some((assignment) => assignment.isFor(attendeeId));
  }

  with(assignment: Assignment): AssignmentCollection {
    return new AssignmentCollection([...this.all(), assignment]);
  }

  membersOf(color: Color): Assignment[] {
    return this.all().filter((assignment) => assignment.isIn(color));
  }

  countOf(color: Color, type: PersonalityType): number {
    return this.membersOf(color).filter((assignment) => assignment.personalityType.equals(type)).length;
  }
}
