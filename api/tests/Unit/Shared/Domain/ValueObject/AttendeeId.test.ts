import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';

describe('AttendeeId', () => {
  it('testAcceptsUuidV7', () => {
    expect(new AttendeeId('0199c8a1-7b3e-7cc2-9f1e-2d4b5a6c7d8e').value).toBe('0199c8a1-7b3e-7cc2-9f1e-2d4b5a6c7d8e');
  });

  it('testRejectsOtherUuidVersions', () => {
    expect(() => new AttendeeId('3b241101-e2bb-4255-8caf-4136c566a962')).toThrow(InvalidArgumentError);
  });

  it('testRejectsMalformedString', () => {
    expect(() => new AttendeeId('attendee-1')).toThrow(InvalidArgumentError);
  });
});
