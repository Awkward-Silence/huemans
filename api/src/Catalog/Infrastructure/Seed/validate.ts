import { countsOf } from '@Huemans/Catalog/Application/ApplicationService';
import { JsonCatalogContentSource } from '../Content/JsonCatalogContentSource';
import { contentFilesFrom } from './contentFilesFrom';

// Usage: pnpm catalog:validate [questions.json] [icebreakers.json] [profiles.json] [trait-types.json]
// Authors the content through the aggregates, as the seed does, without any database.
try {
  const { questions, icebreakers, profiles, mappedTraits } = countsOf(
    new JsonCatalogContentSource(contentFilesFrom(process.argv)).read(),
  );
  console.log(
    `Valid: ${questions} questions, ${icebreakers} icebreakers, ${profiles} profiles and ${mappedTraits} mapped traits.`,
  );
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
