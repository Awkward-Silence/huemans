import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { Uuid } from '@Huemans/Shared/Domain/ValueObject/Uuid';

class TeamId extends Uuid {}

class TeamRenamed extends DomainEvent {
  static readonly EVENT_NAME = 'team.renamed';

  constructor(
    aggregateId: string,
    readonly name: string,
  ) {
    super({ eventName: TeamRenamed.EVENT_NAME, aggregateId });
  }

  toPrimitives(): Record<string, unknown> {
    return { name: this.name };
  }
}

class Team extends AggregateRoot {
  constructor(readonly id: TeamId) {
    super();
  }

  rename(name: string): void {
    this.record(new TeamRenamed(this.id.value, name));
  }

  toDTO(): { id: string } {
    return { id: this.id.value };
  }
}

describe('AggregateRoot', () => {
  let team: Team;

  beforeEach(() => {
    team = new Team(TeamId.random());
  });

  it('testPullsRecordedEventsInOrder', () => {
    team.rename('Reds');
    team.rename('Blues');

    const events = team.pullDomainEvents();

    expect(events.map((event) => (event as TeamRenamed).name)).toEqual(['Reds', 'Blues']);
  });

  it('testPullingEmptiesTheRecordedEvents', () => {
    team.rename('Reds');
    team.pullDomainEvents();

    expect(team.pullDomainEvents()).toEqual([]);
  });

  it('testEventCarriesIdentityAndTime', () => {
    team.rename('Reds');

    const [event] = team.pullDomainEvents();

    expect(event.eventName).toBe('team.renamed');
    expect(event.aggregateId).toBe(team.id.value);
    expect(() => new TeamId(event.eventId)).not.toThrow();
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('testRecordsEventsWhenRebuiltWithoutConstructor', () => {
    const rebuilt = Object.assign(Object.create(Team.prototype) as Team, { id: team.id });

    expect(rebuilt.pullDomainEvents()).toEqual([]);
    rebuilt.rename('Greens');
    expect(rebuilt.pullDomainEvents()).toHaveLength(1);
  });
});
