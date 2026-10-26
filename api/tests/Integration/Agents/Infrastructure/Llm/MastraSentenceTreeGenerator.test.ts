import { SentenceTree } from '@Huemans/Agents/Domain/SentenceTree';
import { MastraSentenceTreeGenerator } from '@Huemans/Agents/Infrastructure/Llm/MastraSentenceTreeGenerator';
import { config } from '@Huemans/config';

// Calls the real model (about two minutes, billed), so it runs only through `pnpm test:llm` with ANTHROPIC_API_KEY set
// (.env.test.local, or CI's secret). That script also adds --experimental-vm-modules, which Jest needs for Mastra's
// dynamic import of its provider and which costs too much memory to turn on for every suite.
const withKey = config.anthropic.apiKey && process.env.LLM_TESTS === 'true' ? describe : describe.skip;

withKey('MastraSentenceTreeGenerator', () => {
  it('testGeneratesADraftThatGrowsIntoACompleteTree', async () => {
    const draft = await new MastraSentenceTreeGenerator().generate();

    const tree = SentenceTree.grow(draft).toDTO();

    expect(tree.options).toHaveLength(3);
    expect(tree.options[2].next[2].next[2].next[2].next[2].id).toBe('3.3.3.3.3');
  }, 200_000);
});
