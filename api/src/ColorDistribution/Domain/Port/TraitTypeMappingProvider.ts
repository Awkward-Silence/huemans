import { TraitTypeMapping } from '../ValueObject/TraitTypeMapping';

export const TRAIT_TYPE_MAPPING_PROVIDER = Symbol('TraitTypeMappingProvider');

export interface TraitTypeMappingProvider {
  mapping(): Promise<TraitTypeMapping>;
}
