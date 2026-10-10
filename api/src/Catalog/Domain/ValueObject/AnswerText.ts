import { CatalogText } from './CatalogText';

export class AnswerText extends CatalogText {
  constructor(value: string) {
    super(value, 80);
  }
}
