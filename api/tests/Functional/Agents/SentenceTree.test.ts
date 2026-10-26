import { INestApplication } from '@nestjs/common';
import type { SentenceOptionResponse, SentenceTreeResponse } from '../../../contracts/sentenceTree';
import { SENTENCE_TREE_GENERATOR, SentenceTreeGenerator } from '@Huemans/Agents/Domain/Port/SentenceTreeGenerator';
import { SentenceTreeDraft } from '@Huemans/Agents/Domain/SentenceTreeDraft';
import { SentenceTreeUnavailable } from '@Huemans/Agents/Domain/SentenceTreeUnavailable';
import { bootFunctional, getJson } from '../../Support/functional';
import { completeDraft } from '../../Unit/Agents/Domain/SentenceTreeDraftMother';

const leavesOf = (options: SentenceOptionResponse[]): SentenceOptionResponse[] =>
  options.flatMap((option) => (option.next.length === 0 ? [option] : leavesOf(option.next)));

describe('GET /sentence-tree', () => {
  let app: INestApplication;
  let generate: jest.Mock<Promise<SentenceTreeDraft>, []>;

  beforeEach(async () => {
    generate = jest.fn<Promise<SentenceTreeDraft>, []>();
    const generator: SentenceTreeGenerator = { generate };
    app = await bootFunctional({ overrides: [{ provide: SENTENCE_TREE_GENERATOR, useValue: generator }] });
  });

  afterEach(async () => {
    await app.close();
  });

  it('testServesTheGeneratedTree', async () => {
    generate.mockResolvedValue(completeDraft());

    const response = await getJson(app, '/sentence-tree');

    expect(response.status).toBe(200);
    const tree = response.body as SentenceTreeResponse;
    expect(tree).toMatchObject({ id: 'sentence-i', starter: 'I', picks: 5 });
    expect(tree.options[0]).toMatchObject({ id: '1', text: 'loudly a', trait: 'curious' });
    expect(leavesOf(tree.options)).toHaveLength(243);
  });

  it('testGeneratesTheTreeOncePerProcess', async () => {
    generate.mockResolvedValue(completeDraft());

    const [first, second] = await Promise.all([getJson(app, '/sentence-tree'), getJson(app, '/sentence-tree')]);
    const third = await getJson(app, '/sentence-tree');

    expect(generate).toHaveBeenCalledTimes(1);
    expect(second.body).toEqual(first.body);
    expect(third.body).toEqual(first.body);
  });

  it('testRetriesAnUnusableDraft', async () => {
    generate.mockResolvedValueOnce(completeDraft(3)).mockResolvedValueOnce(completeDraft());

    expect((await getJson(app, '/sentence-tree')).status).toBe(200);
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('testIsUnavailableWhenNoDraftIsUsable', async () => {
    generate.mockRejectedValueOnce(new Error('provider down')).mockResolvedValueOnce(completeDraft(3));

    expect((await getJson(app, '/sentence-tree')).status).toBe(503);
  });

  it('testTriesAgainAfterAFailedGeneration', async () => {
    generate.mockRejectedValueOnce(new Error('provider down')).mockRejectedValueOnce(new Error('provider down'));
    await getJson(app, '/sentence-tree');
    generate.mockResolvedValue(completeDraft());

    expect((await getJson(app, '/sentence-tree')).status).toBe(200);
  });

  it('testIsUnavailableWithoutAModelAndDoesNotRetry', async () => {
    generate.mockRejectedValue(new SentenceTreeUnavailable('OPENAI_API_KEY is not set'));

    const response = await getJson(app, '/sentence-tree');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ message: 'OPENAI_API_KEY is not set' });
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
