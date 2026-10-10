import { CatalogText } from './CatalogText';

export class Nickname extends CatalogText {
  constructor(value: string) {
    super(value.trim(), 80);
  }
}
