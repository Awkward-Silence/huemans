import { MeetingSpot } from '@Huemans/NightIcebreaker/Domain/ValueObject/MeetingSpot';
import { Color, COLORS } from '@Huemans/Shared/Domain/ValueObject/Color';

describe('MeetingSpot', () => {
  it('testEveryColorHasItsOwnSpot', () => {
    const spots = COLORS.map((color) => MeetingSpot.for(new Color(color)).value);

    expect(new Set(spots).size).toBe(COLORS.length);
    expect(MeetingSpot.for(new Color('amber')).value).toBe('the bar');
  });
});
