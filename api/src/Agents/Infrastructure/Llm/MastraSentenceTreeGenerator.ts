import { Agent } from '@mastra/core/agent';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { SentenceTreeGenerator } from '@Huemans/Agents/Domain/Port/SentenceTreeGenerator';
import { SentenceOptionDraft, SentenceTreeDraft } from '@Huemans/Agents/Domain/SentenceTreeDraft';
import { SentenceTreeUnavailable } from '@Huemans/Agents/Domain/SentenceTreeUnavailable';
import { TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { config } from '@Huemans/config';
import { SENTENCE_TREE_INSTRUCTIONS, SENTENCE_TREE_REQUEST } from './sentenceTreePrompt';

// Recursive, so the schema stays within OpenAI's strict-mode nesting limit (10 levels; spelled-out picks need 11).
// No count bounds here: Mastra turns them into hints anyway, and a miscount would reject the whole tree. The prompt
// asks for 3, and the domain keeps the first 3 usable options of each pick.
const SentenceOptionOutput: z.ZodType<SentenceOptionDraft> = z.object({
  text: z.string(),
  trait: z.enum(TRAITS),
  get next() {
    return z.array(SentenceOptionOutput).describe('3 options for the next pick, empty after pick 5');
  },
});
const SentenceTreeOutput = z.object({
  options: z.array(SentenceOptionOutput).describe('3 options for pick 1'),
});

/** The whole tree is ~6k output tokens plus reasoning: allow headroom, and a deadline so a stalled call can be retried. */
const MAX_OUTPUT_TOKENS = 16_000;
const DEADLINE_MS = 180_000;

@Injectable()
export class MastraSentenceTreeGenerator implements SentenceTreeGenerator {
  private readonly agent: Agent | null = config.openAi.apiKey
    ? new Agent({
        id: 'sentence-tree',
        name: 'Sentence tree',
        instructions: SENTENCE_TREE_INSTRUCTIONS,
        model: { id: `openai/${config.openAi.model}`, apiKey: config.openAi.apiKey },
      })
    : null;

  async generate(): Promise<SentenceTreeDraft> {
    if (this.agent === null) {
      throw new SentenceTreeUnavailable('OPENAI_API_KEY is not set');
    }
    const output = await this.agent.generate(SENTENCE_TREE_REQUEST, {
      structuredOutput: { schema: SentenceTreeOutput },
      modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS, timeout: { totalMs: DEADLINE_MS } },
      providerOptions: { openai: { reasoningEffort: config.openAi.reasoningEffort } },
    });
    // Mastra has already validated it against SentenceTreeOutput, but loses the recursive type on the way.
    return (output.object as z.infer<typeof SentenceTreeOutput>).options;
  }
}
