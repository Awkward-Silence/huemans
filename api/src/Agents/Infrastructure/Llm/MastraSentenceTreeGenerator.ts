import { Agent } from '@mastra/core/agent';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { SentenceTreeGenerator } from '@Huemans/Agents/Domain/Port/SentenceTreeGenerator';
import { SentenceOptionDraft, SentenceTreeDraft } from '@Huemans/Agents/Domain/SentenceTreeDraft';
import { PICKS } from '@Huemans/Agents/Domain/SentenceTree';
import { SentenceTreeUnavailable } from '@Huemans/Agents/Domain/SentenceTreeUnavailable';
import { TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { config } from '@Huemans/config';
import { SENTENCE_TREE_INSTRUCTIONS, SENTENCE_TREE_REQUEST } from './sentenceTreePrompt';

// Spelled out one level per pick: Anthropic's structured output rejects self-referencing schemas. No count bounds
// here: a miscount would reject the whole tree. The prompt asks for 3, and the domain keeps the first 3 usable options
// of each pick.
let SentenceOptionOutput: z.ZodType<SentenceOptionDraft> = z.object({ text: z.string(), trait: z.enum(TRAITS) });
for (let pick = PICKS - 1; pick >= 1; pick--) {
  SentenceOptionOutput = z.object({
    text: z.string(),
    trait: z.enum(TRAITS),
    next: z.array(SentenceOptionOutput).describe(`3 options for pick ${pick + 1}`),
  });
}
const SentenceTreeOutput = z.object({
  options: z.array(SentenceOptionOutput).describe('3 options for pick 1'),
});

/** The whole tree is ~6k output tokens plus thinking: allow headroom, and a deadline so a stalled call can be retried. */
const MAX_OUTPUT_TOKENS = 32_000;
const DEADLINE_MS = 180_000;

@Injectable()
export class MastraSentenceTreeGenerator implements SentenceTreeGenerator {
  private readonly agent: Agent | null = config.anthropic.apiKey
    ? new Agent({
        id: 'sentence-tree',
        name: 'Sentence tree',
        instructions: SENTENCE_TREE_INSTRUCTIONS,
        // Mastra's model list predates claude-sonnet-5-5; its router passes unlisted ids through to Anthropic.
        model: {
          id: `anthropic/${config.anthropic.model}`,
          apiKey: config.anthropic.apiKey,
        },
      })
    : null;

  async generate(): Promise<SentenceTreeDraft> {
    if (this.agent === null) {
      throw new SentenceTreeUnavailable('ANTHROPIC_API_KEY is not set');
    }
    const output = await this.agent.generate(SENTENCE_TREE_REQUEST, {
      structuredOutput: { schema: SentenceTreeOutput },
      modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS, timeout: { totalMs: DEADLINE_MS } },
      // Writing the tree takes little reasoning; Sonnet's default (high) thinks long enough to miss the deadline.
      providerOptions: { anthropic: { effort: 'low' } },
    });
    // Mastra has already validated it against SentenceTreeOutput, but loses its type on the way.
    return (output.object as z.infer<typeof SentenceTreeOutput>).options;
  }
}
