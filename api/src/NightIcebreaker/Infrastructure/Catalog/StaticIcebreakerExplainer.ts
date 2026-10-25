import { Injectable } from '@nestjs/common';
import { IcebreakerExplainer } from '@Huemans/NightIcebreaker/Domain/Port/IcebreakerExplainer';
import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';
import { IcebreakerReason } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerReason';
import { RoomProfile } from '@Huemans/NightIcebreaker/Domain/ValueObject/RoomProfile';

// The fallback sentence; the IcebreakerExplainer agent may later write a livelier one behind the same port.
@Injectable()
export class StaticIcebreakerExplainer implements IcebreakerExplainer {
  explain(room: RoomProfile, match: IcebreakerCandidate): Promise<IcebreakerReason> {
    const strongest = room
      .strongestOf(match.traits)
      .slice(0, 2)
      .map((trait) => trait.value);
    const sentence =
      strongest.length === 0
        ? 'Picked for everyone here tonight.'
        : `Picked for a room that leans ${strongest.join(' and ')}.`;
    return Promise.resolve(new IcebreakerReason(sentence));
  }
}
