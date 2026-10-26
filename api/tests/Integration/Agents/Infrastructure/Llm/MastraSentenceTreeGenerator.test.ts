import { SentenceTree } from '@Huemans/Agents/Domain/SentenceTree';
import { MastraSentenceTreeGenerator } from '@Huemans/Agents/Infrastructure/Llm/MastraSentenceTreeGenerator';
import { config } from '@Huemans/config';

// Calls the real model, so it runs only with ANTHROPIC_API_KEY in .env.test (or CI's secret written there). About a minute.
// Mastra loads its provider with a dynamic import, which Jest only runs with --experimental-vm-modules: use
// `pnpm test:integration`, or `NODE_OPTIONS=--experimental-vm-modules pnpm jest <this file>`.
const withKey = config.anthropic.apiKey ? describe : describe.skip;

withKey('MastraSentenceTreeGenerator', () => {
  it('testGeneratesADraftThatGrowsIntoACompleteTree', async () => {
    const draft = await new MastraSentenceTreeGenerator().generate();

    const tree = SentenceTree.grow(draft).toDTO();

    expect(tree.options).toHaveLength(3);
    expect(tree.options[2].next[2].next[2].next[2].next[2].id).toBe('3.3.3.3.3');
  }, 200_000);
});
