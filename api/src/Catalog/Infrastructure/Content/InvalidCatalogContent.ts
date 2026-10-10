export class InvalidCatalogContent extends Error {
  constructor(path: string, problems: string[]) {
    super(`${path} is invalid:\n  ${problems.join('\n  ')}`);
    this.name = new.target.name;
  }
}
