import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { QuestionAuthored } from '@Huemans/Catalog/Domain/Event/QuestionAuthored';
import { InvalidCatalogContent } from '@Huemans/Catalog/Infrastructure/Content/InvalidCatalogContent';
import {
  CatalogFilePaths,
  DEFAULT_CATALOG_FILES,
  JsonCatalogContentSource,
} from '@Huemans/Catalog/Infrastructure/Content/JsonCatalogContentSource';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

// Reads the real content files from disk, and edited copies of them.
describe('JsonCatalogContentSource', () => {
  let withEdited: <T>(file: keyof CatalogFilePaths, edit: (json: T) => void) => CatalogFilePaths;

  beforeEach(() => {
    withEdited = <T>(file: keyof CatalogFilePaths, edit: (json: T) => void) => {
      const json = JSON.parse(readFileSync(DEFAULT_CATALOG_FILES[file], 'utf8')) as T;
      edit(json);
      const path = join(mkdtempSync(join(tmpdir(), 'catalog-')), `${file}.json`);
      writeFileSync(path, JSON.stringify(json));
      return { ...DEFAULT_CATALOG_FILES, [file]: path };
    };
  });

  it('testAuthorsTheRealContent', () => {
    const { questions, icebreakers, personalityTypes } = new JsonCatalogContentSource().read();

    expect(questions).toHaveLength(50);
    expect(icebreakers).toHaveLength(51);
    expect(Object.keys(personalityTypes.toDTO().mapping)).toHaveLength(33);
    expect(personalityTypes.profileOf(new PersonalityType('planner')).nickname).toBe('The Planners');
    expect(questions[0].pullDomainEvents()).toEqual([expect.any(QuestionAuthored)]);
  });

  it('testNamesTheInvalidAnswer', () => {
    const paths = withEdited('questions', (questions: { answers: { trait: string }[] }[]) => {
      questions[2].answers[1].trait = 'grumpy';
    });

    const read = () => new JsonCatalogContentSource(paths).read();

    expect(read).toThrow(InvalidCatalogContent);
    expect(read).toThrow(/q0003 answers\.1\.trait/);
  });

  it('testNamesATooLongQuestionText', () => {
    const paths = withEdited('questions', (questions: { text: string }[]) => {
      questions[4].text = 'x'.repeat(81);
    });

    expect(() => new JsonCatalogContentSource(paths).read()).toThrow(/q0005 text: <QuestionText> must be at most 80/);
  });

  it('testNamesTheProfileWithAChipOfAnotherType', () => {
    const paths = withEdited('profiles', (profiles: { type: string; traits: string[] }[]) => {
      profiles.find((profile) => profile.type === 'planner')!.traits[0] = 'curious';
    });

    expect(() => new JsonCatalogContentSource(paths).read()).toThrow(/planner chip curious is mapped to explorer/);
  });

  it('testNamesTheFileWhenItsShapeIsWrong', () => {
    const paths = withEdited('icebreakers', (icebreakers: { text: unknown }[]) => {
      icebreakers[0].text = 42;
    });

    expect(() => new JsonCatalogContentSource(paths).read()).toThrow(/icebreakers\.json is invalid/);
  });
});
