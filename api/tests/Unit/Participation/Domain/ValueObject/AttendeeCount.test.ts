import { AttendeeCount } from '@Huemans/Participation/Domain/ValueObject/AttendeeCount';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('AttendeeCount', () => {
  it('testAcceptsZero', () => {
    expect(new AttendeeCount(0).value).toBe(0);
  });

  it.each([[-1], [1.5]])('testRejectsTheCount %p', (count) => {
    expect(() => new AttendeeCount(count)).toThrow(InvalidArgumentError);
  });
});
