import { EventName } from '@Huemans/Event/Domain/ValueObject/EventName';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('EventName', () => {
  it('testKeepsTheTrimmedName', () => {
    expect(new EventName('  Demo night  ').value).toBe('Demo night');
  });

  it('testRejectsABlankName', () => {
    expect(() => new EventName('   ')).toThrow(InvalidArgumentError);
  });

  it('testRejectsANameThatIsNotText', () => {
    expect(() => new EventName(42 as unknown as string)).toThrow(InvalidArgumentError);
  });

  it('testAcceptsAt255Characters', () => {
    expect(new EventName('a'.repeat(255)).value).toHaveLength(255);
  });

  it('testRejectsMoreThan255Characters', () => {
    expect(() => new EventName('a'.repeat(256))).toThrow(InvalidArgumentError);
  });

  it('testLimitAppliesAfterTrimming', () => {
    expect(new EventName(` ${'a'.repeat(255)} `).value).toHaveLength(255);
  });
});
