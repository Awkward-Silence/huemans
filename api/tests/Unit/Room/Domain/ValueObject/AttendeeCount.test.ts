import { AttendeeCount } from '@Huemans/Room/Domain/ValueObject/AttendeeCount';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('AttendeeCount', () => {
  it('testAcceptsZero', () => {
    expect(new AttendeeCount(0).value).toBe(0);
  });

  it('testRejectsANegativeCount', () => {
    expect(() => new AttendeeCount(-1)).toThrow(InvalidArgumentError);
  });

  it('testRejectsAFractionalCount', () => {
    expect(() => new AttendeeCount(1.5)).toThrow(InvalidArgumentError);
  });
});
