import { Assignment } from '@Huemans/ColorDistribution/Domain/Assignment';
import { AssignmentCollection } from '@Huemans/ColorDistribution/Domain/AssignmentCollection';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

describe('AssignmentCollection', () => {
  let eventId: EventId;
  let attendeeId: AttendeeId;
  let explorer: PersonalityType;

  beforeEach(() => {
    eventId = EventId.random();
    attendeeId = AttendeeId.random();
    explorer = new PersonalityType('explorer');
  });

  it('testRejectsTwoAssignmentsForTheSameAttendee', () => {
    const amber = new Assignment(eventId, attendeeId, new Color('amber'), explorer, new Date());
    const violet = new Assignment(eventId, attendeeId, new Color('violet'), explorer, new Date());

    expect(() => new AssignmentCollection([amber, violet])).toThrow(InvalidArgumentError);
  });
});
