import { z } from 'zod';

// Shape only: every trait mapped once to a known type is the TraitTypeMapping's rule.
export const TraitTypeMappingContentSchema = z.record(z.string(), z.string());
