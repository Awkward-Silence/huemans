import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { AttendeeAssignmentView } from '../AttendeeAssignmentView';

export const COLOR_EXPLAINER = Symbol('ColorExplainer');

/** Reveal copy for an assignment: the attendee's personality type, and why their group fits it. */
export interface ColorExplanation {
  nickname: string;
  blurb: string;
  traits: TraitValue[];
  reason: string;
}

export interface ColorExplainer {
  explain(assignment: AttendeeAssignmentView): Promise<ColorExplanation>;
}
