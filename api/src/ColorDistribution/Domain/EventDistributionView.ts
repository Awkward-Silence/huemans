export interface EventDistributionView {
  eventId: string;
  groups: { color: string; members: number; personalityTypes: string[] }[];
}
