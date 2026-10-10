import { AttendeeAlreadyAssigned } from '@Huemans/ColorDistribution/Domain/AttendeeAlreadyAssigned';
import { AttendeeGrouped } from '@Huemans/ColorDistribution/Domain/AttendeeGrouped';
import { EventDistribution } from '@Huemans/ColorDistribution/Domain/EventDistribution';
import { TraitProfile } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitProfile';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { mappingWith } from './TraitTypeMappingMother';

function profile(...traits: TraitValue[]): TraitProfile {
  return new TraitProfile(traits.map((trait) => new Trait(trait)));
}

describe('EventDistribution', () => {
  let eventId: EventId;
  let distribution: EventDistribution;
  let mapping: TraitTypeMapping;

  beforeEach(() => {
    eventId = EventId.random();
    distribution = EventDistribution.open(eventId);
    mapping = mappingWith({
      curious: 'explorer',
      adventurous: 'explorer',
      spontaneous: 'explorer',
      sociable: 'connector',
      empathetic: 'connector',
      organized: 'planner',
      practical: 'planner',
      romantic: 'dreamer',
    });
  });

  function typeAssignedTo(attendeeId: AttendeeId): string | undefined {
    return distribution.assignments().find((assignment) => assignment.isFor(attendeeId))?.personalityType.value;
  }

  function colorAssignedTo(attendeeId: AttendeeId): string | undefined {
    return distribution.assignments().find((assignment) => assignment.isFor(attendeeId))?.color.value;
  }

  // One attendee per entry, each with a single trait of that type.
  function assignTypes(...types: ('explorer' | 'connector' | 'planner' | 'dreamer')[]): AttendeeId[] {
    const traitOf = { explorer: 'curious', connector: 'sociable', planner: 'organized', dreamer: 'romantic' } as const;
    return types.map((type) => {
      const attendeeId = AttendeeId.random();
      distribution.assign(attendeeId, profile(traitOf[type]), mapping);
      return attendeeId;
    });
  }

  function groupSizes(): number[] {
    return distribution.toDTO().groups.map((group) => group.members);
  }

  it('testOpensWithFourEmptyGroups', () => {
    expect(distribution.toDTO()).toEqual({
      eventId: eventId.value,
      groups: [
        { color: 'RED', members: 0, personalityTypes: [] },
        { color: 'YELLOW', members: 0, personalityTypes: [] },
        { color: 'GREEN', members: 0, personalityTypes: [] },
        { color: 'BLUE', members: 0, personalityTypes: [] },
      ],
    });
    expect(distribution.pullDomainEvents()).toEqual([]);
  });

  it('testClearMajorityDecidesTheType', () => {
    const attendeeId = AttendeeId.random();

    distribution.assign(attendeeId, profile('curious', 'adventurous', 'spontaneous', 'organized'), mapping);

    expect(typeAssignedTo(attendeeId)).toBe('explorer');
  });

  it('testRepeatedTraitCountsEveryTime', () => {
    const attendeeId = AttendeeId.random();

    distribution.assign(attendeeId, profile('curious', 'curious', 'sociable'), mapping);

    expect(typeAssignedTo(attendeeId)).toBe('explorer');
  });

  it('testFirstAttendeesFillGroupsInColorOrder', () => {
    const attendees = assignTypes('explorer', 'explorer', 'explorer', 'explorer');

    expect(attendees.map(colorAssignedTo)).toEqual(['RED', 'YELLOW', 'GREEN', 'BLUE']);
  });

  it('testSmallestGroupsComeFirst', () => {
    assignTypes('planner', 'connector', 'connector', 'planner', 'dreamer', 'dreamer', 'dreamer');
    expect(groupSizes()).toEqual([2, 2, 2, 1]);

    const [planner] = assignTypes('planner');

    expect(colorAssignedTo(planner)).toBe('BLUE');
  });

  it('testAttendeeJoinsTheGroupLackingTheirType', () => {
    assignTypes('explorer', 'explorer', 'planner', 'connector');

    const [explorer] = assignTypes('explorer');

    expect(colorAssignedTo(explorer)).toBe('GREEN');
  });

  it('testTiedAttendeeTakesTheTypeTheGroupLacks', () => {
    assignTypes('explorer', 'explorer', 'explorer', 'planner', 'planner', 'planner', 'connector', 'connector');
    expect(distribution.toDTO().groups.map((group) => group.personalityTypes)).toEqual([
      ['explorer', 'planner'],
      ['explorer', 'planner'],
      ['explorer', 'connector'],
      ['planner', 'connector'],
    ]);
    const attendeeId = AttendeeId.random();

    distribution.assign(attendeeId, profile('curious', 'organized'), mapping);

    expect(colorAssignedTo(attendeeId)).toBe('GREEN');
    expect(typeAssignedTo(attendeeId)).toBe('planner');
  });

  it('testSizesNeverDriftApart', () => {
    const types = ['explorer', 'explorer', 'planner', 'dreamer', 'explorer', 'connector', 'explorer'] as const;

    for (let i = 0; i < 13; i++) {
      assignTypes(types[i % types.length]);
      expect(Math.max(...groupSizes()) - Math.min(...groupSizes())).toBeLessThanOrEqual(1);
    }

    expect([...groupSizes()].sort()).toEqual([3, 3, 3, 4]);
  });

  it('testAssignmentRecordsAttendeeGrouped', () => {
    assignTypes('explorer');
    distribution.pullDomainEvents();
    const attendeeId = AttendeeId.random();

    distribution.assign(attendeeId, profile('sociable'), mapping);

    const events = distribution.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AttendeeGrouped);
    expect(events[0].aggregateId).toBe(eventId.value);
    expect(events[0].toPrimitives()).toEqual({
      eventId: eventId.value,
      attendeeId: attendeeId.value,
      color: 'YELLOW',
      personalityType: 'connector',
    });
  });

  it('testSecondAssignmentIsRejectedAndKeepsTheFirst', () => {
    const [attendeeId] = assignTypes('explorer');
    distribution.pullDomainEvents();

    expect(() => distribution.assign(attendeeId, profile('organized'), mapping)).toThrow(AttendeeAlreadyAssigned);

    expect(distribution.pullDomainEvents()).toEqual([]);
    expect(distribution.assignments()).toHaveLength(1);
    expect(colorAssignedTo(attendeeId)).toBe('RED');
    expect(typeAssignedTo(attendeeId)).toBe('explorer');
  });
});
