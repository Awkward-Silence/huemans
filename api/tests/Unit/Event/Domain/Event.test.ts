import { Event } from '@Huemans/Event/Domain/Event';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { EventRevealed } from '@Huemans/Event/Domain/EventRevealed';
import { EventName } from '@Huemans/Event/Domain/ValueObject/EventName';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

describe('Event', () => {
  let id: EventId;
  let event: Event;

  beforeEach(() => {
    id = EventId.random();
    event = Event.create(id, new EventName('Demo night'));
  });

  it('testANewEventIsOpen', () => {
    expect(event.toDTO().status).toBe('open');
  });

  it('testCreatingAnEventRecordsEventCreatedOnce', () => {
    const events = event.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(EventCreated);
    expect(events[0].aggregateId).toBe(id.value);
    expect(event.pullDomainEvents()).toHaveLength(0);
  });

  it('testViewHoldsIdNameAndStatus', () => {
    expect(event.toDTO()).toEqual({ id: id.value, name: 'Demo night', status: 'open' });
  });

  it('testRevealMovesOpenToRevealed', () => {
    event.pullDomainEvents();

    event.reveal();

    expect(event.toDTO().status).toBe('revealed');
    const events = event.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(EventRevealed);
    expect(events[0].aggregateId).toBe(id.value);
  });

  it('testRevealTwiceRecordsOneEvent', () => {
    event.pullDomainEvents();

    event.reveal();
    event.reveal();

    expect(event.pullDomainEvents()).toHaveLength(1);
    expect(event.toDTO().status).toBe('revealed');
  });
});
