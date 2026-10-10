import { EVENT_STATUSES, EventStatus } from '@Huemans/Event/Domain/ValueObject/EventStatus';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('EventStatus', () => {
  it('testAcceptsOpenAndRevealed', () => {
    expect(EVENT_STATUSES.map((status) => new EventStatus(status).value)).toEqual(['open', 'revealed']);
  });

  it('testRejectsAnUnknownStatus', () => {
    expect(() => new EventStatus('closed')).toThrow(InvalidArgumentError);
  });
});
