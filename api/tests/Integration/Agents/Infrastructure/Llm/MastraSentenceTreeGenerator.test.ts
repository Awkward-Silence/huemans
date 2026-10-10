import { SentenceTree } from '@Huemans/Agents/Domain/SentenceTree';
import { MastraSentenceTreeGenerator } from '@Huemans/Agents/Infrastructure/Llm/MastraSentenceTreeGenerator';
import { config } from '@Huemans/config';

// Calls the real model, so it runs only with OPENAI_API_KEY in .env.test (or CI's secret written there). About a minute.
const withKey = config.openAi.apiKey ? describe : describe.skip;

withKey('MastraSentenceTreeGenerator', () => {
  it('testGeneratesADraftThatGrowsIntoACompleteTree', async () => {
    const draft = await new MastraSentenceTreeGenerator().generate();

    const tree = SentenceTree.grow(draft).toDTO();

    expect(tree.options).toHaveLength(3);
    expect(tree.options[2].next[2].next[2].next[2].next[2].id).toBe('3.3.3.3.3');
  }, 200_000);
});
