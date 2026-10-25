export type Locked = { status: 'locked' };

export type HostIcebreakerView = Locked | { status: 'ready'; question: string; why: string; gatherEndsAt: string };

export type AttendeeIcebreakerView =
  Locked | { status: 'ready'; question: string; why: string; meetingSpot: string; gatherEndsAt: string };
