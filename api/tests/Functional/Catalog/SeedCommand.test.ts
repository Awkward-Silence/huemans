import { spawnSync, SpawnSyncReturns } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CATALOG_FILES } from '@Huemans/Catalog/Infrastructure/Seed/CatalogFiles';

// Runs the real `catalog:seed` entry point against the test database (DATABASE_URL comes from .env.test).
function runSeed(...files: string[]): SpawnSyncReturns<string> {
  return spawnSync(
    'pnpm',
    ['exec', 'ts-node', '-r', 'tsconfig-paths/register', 'src/Catalog/Infrastructure/Seed/seed.ts', ...files],
    { encoding: 'utf8', env: process.env },
  );
}

describe('pnpm catalog:seed', () => {
  jest.setTimeout(60_000);

  it('testSeedsTheDefaultFiles', () => {
    const result = runSeed();

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Seeded 50 questions, 51 icebreakers, 4 profiles and 33 mapped traits.');
  });

  it('testFailsOnAnInvalidFileAndNamesTheEntry', () => {
    const questions = JSON.parse(readFileSync(DEFAULT_CATALOG_FILES.questions, 'utf8')) as {
      answers: { trait: string }[];
    }[];
    questions[2].answers[1].trait = 'grumpy';
    const path = join(mkdtempSync(join(tmpdir(), 'catalog-')), 'questions.json');
    writeFileSync(path, JSON.stringify(questions));

    const result = runSeed(path);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('q0003 answers.1.trait');
  });
});
