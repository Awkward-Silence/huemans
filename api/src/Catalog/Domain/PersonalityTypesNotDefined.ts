// Not a NotFoundError: the personality types always exist once seeded, so missing ones are a deploy fault (500).
export class PersonalityTypesNotDefined extends Error {
  constructor() {
    super('The catalog has no personality types; run the catalog seed');
    this.name = new.target.name;
  }
}
