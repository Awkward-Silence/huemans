import { IcebreakerCandidate } from '../ValueObject/IcebreakerCandidate';
import { IcebreakerReason } from '../ValueObject/IcebreakerReason';
import { RoomProfile } from '../ValueObject/RoomProfile';

export const ICEBREAKER_EXPLAINER = Symbol('IcebreakerExplainer');

/** Writes why the room got its icebreaker. It only explains: the pick is already made. */
export interface IcebreakerExplainer {
  explain(room: RoomProfile, match: IcebreakerCandidate): Promise<IcebreakerReason>;
}
