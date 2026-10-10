import { CatalogText } from './CatalogText';

export class Blurb extends CatalogText {
  constructor(value: string) {
    super(value, 200);
  }
}
