import type { Icebreaker } from '@Huemans/Types/Icebreaker';

export const ICEBREAKER_REPOSITORY = Symbol('IcebreakerRepository');

export interface IcebreakerRepository {
  /** Every icebreaker ordered by id. */
  all(): Promise<Icebreaker[]>;
  /** Inserts or updates by id; never deletes. */
  upsert(icebreakers: Icebreaker[]): Promise<void>;
}
