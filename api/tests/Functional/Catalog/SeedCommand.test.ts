import { spawnSync, SpawnSyncReturns } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CATALOG_FILES } from '@Huemans/Catalog/Infrastructure/Content/JsonCatalogContentSource';
import { createScratchDatabase, ScratchDatabase } from '../../Support/scratchDatabase';

// Runs the real entry points as processes, against a database that was never seeded.
describe('pnpm catalog:seed and catalog:validate', () => {
  jest.setTimeout(120_000);

  let scratch: ScratchDatabase;
  let run: (script: 'seed' | 'validate', databaseUrl: string, ...files: string[]) => SpawnSyncReturns<string>;
  let invalidQuestions: string;

  beforeAll(async () => {
    scratch = await createScratchDatabase();
    run = (script, databaseUrl, ...files) =>
      spawnSync(
        'pnpm',
        ['exec', 'ts-node', '-r', 'tsconfig-paths/register', `src/Catalog/Infrastructure/Seed/${script}.ts`, ...files],
        { encoding: 'utf8', env: { ...process.env, DATABASE_URL: databaseUrl } },
      );
    const questions = JSON.parse(readFileSync(DEFAULT_CATALOG_FILES.questions, 'utf8')) as {
      answers: { trait: string }[];
    }[];
    questions[2].answers[1].trait = 'grumpy';
    invalidQuestions = join(mkdtempSync(join(tmpdir(), 'catalog-')), 'questions.json');
    writeFileSync(invalidQuestions, JSON.stringify(questions));
  });

  afterAll(async () => {
    await scratch.drop();
  });

  it('testSeedFailsOnAnInvalidFileAndNamesTheEntry', () => {
    const result = run('seed', scratch.url, invalidQuestions);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('q0003 answers.1.trait');
  });

  it('testSeedSeedsOnceThenReportsAlreadySeeded', () => {
    const first = run('seed', scratch.url);
    const second = run('seed', scratch.url);

    expect(first.stderr).toBe('');
    expect(first.status).toBe(0);
    expect(first.stdout).toContain('Seeded 53 questions, 51 icebreakers, 4 profiles and 33 mapped traits.');
    expect(second.status).toBe(0);
    expect(second.stdout).toMatch(/Catalog already seeded at \d{4}-\d{2}-\d{2}T.*; nothing written\./);
  });

  // An unreachable database URL proves the check never connects to one.
  it('testValidatePassesOnTheRealFilesWithoutAnyDatabase', () => {
    const result = run('validate', 'postgresql://nobody:nothing@127.0.0.1:1/none');

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Valid: 53 questions, 51 icebreakers, 4 profiles and 33 mapped traits.');
  });

  it('testValidateNamesTheInvalidEntryWithoutAnyDatabase', () => {
    const result = run('validate', 'postgresql://nobody:nothing@127.0.0.1:1/none', invalidQuestions);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('q0003 answers.1.trait');
  });
});
