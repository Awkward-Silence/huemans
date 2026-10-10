import { CatalogText } from './CatalogText';

export class QuestionText extends CatalogText {
  constructor(value: string) {
    super(value, 80);
  }
}
