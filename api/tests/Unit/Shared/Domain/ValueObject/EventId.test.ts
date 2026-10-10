import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

describe('EventId', () => {
  it('testAcceptsUuidV7', () => {
    expect(new EventId('0199c8a1-7b3e-7cc2-9f1e-2d4b5a6c7d8e').value).toBe('0199c8a1-7b3e-7cc2-9f1e-2d4b5a6c7d8e');
  });

  it('testRejectsOtherUuidVersions', () => {
    expect(() => new EventId('3b241101-e2bb-4255-8caf-4136c566a962')).toThrow(InvalidArgumentError);
  });

  it('testRejectsMalformedString', () => {
    expect(() => new EventId('event-1')).toThrow(InvalidArgumentError);
  });
});
