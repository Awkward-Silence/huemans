import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Uuid } from '@Huemans/Shared/Domain/ValueObject/Uuid';

class TeamId extends Uuid {}

describe('Uuid', () => {
  it('testAcceptsVersion7', () => {
    expect(new TeamId('0199c8a1-7b3e-7cc2-9f1e-2d4b5a6c7d8e').value).toBe('0199c8a1-7b3e-7cc2-9f1e-2d4b5a6c7d8e');
  });

  it('testRejectsVersion4', () => {
    expect(() => new TeamId('3b241101-e2bb-4255-8caf-4136c566a962')).toThrow(InvalidArgumentError);
  });

  it('testRejectsMalformedString', () => {
    expect(() => new TeamId('not-a-uuid')).toThrow(InvalidArgumentError);
  });

  it('testRandomGeneratesVersion7OfTheCallingClass', () => {
    const id = TeamId.random();

    expect(id).toBeInstanceOf(TeamId);
    expect(id.value[14]).toBe('7');
  });

  it('testRandomIdsAreTimeOrdered', () => {
    const first = TeamId.random();
    const second = TeamId.random();

    expect(first.value < second.value).toBe(true);
  });
});
