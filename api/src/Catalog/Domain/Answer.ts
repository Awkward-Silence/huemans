import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { AnswerId } from './ValueObject/AnswerId';
import { AnswerText } from './ValueObject/AnswerText';

/** Entity of a Question: one selectable answer, identified by its AnswerId; picking it hints at its trait. */
export class Answer {
  constructor(
    readonly id: AnswerId,
    readonly text: AnswerText,
    readonly trait: Trait,
  ) {}
}
