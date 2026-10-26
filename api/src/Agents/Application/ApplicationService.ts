import { Inject, Injectable } from '@nestjs/common';
import { SENTENCE_TREE_GENERATOR, SentenceTreeGenerator } from '@Huemans/Agents/Domain/Port/SentenceTreeGenerator';
import { SentenceTree } from '@Huemans/Agents/Domain/SentenceTree';
import { SentenceTreeUnavailable } from '@Huemans/Agents/Domain/SentenceTreeUnavailable';
import { SentenceTreeView } from '@Huemans/Agents/Domain/SentenceTreeView';

/** Generations per request before giving up; each one is a long model call. */
const ATTEMPTS = 2;
/** After a failure, requests answer 503 at once for this long: the endpoint is anonymous and every attempt is paid. */
const FAILURE_COOLDOWN_MS = 60_000;

@Injectable()
export class ApplicationService {
  // One tree per process: generated once, then served from memory. Concurrent callers share the same generation.
  private sentenceTreeOnce: Promise<SentenceTreeView> | null = null;
  private failedAt: number | null = null;

  constructor(@Inject(SENTENCE_TREE_GENERATOR) private readonly generator: SentenceTreeGenerator) {}

  sentenceTree(): Promise<SentenceTreeView> {
    if (this.failedAt !== null && Date.now() - this.failedAt >= FAILURE_COOLDOWN_MS) {
      this.sentenceTreeOnce = null;
      this.failedAt = null;
    }
    // Until the cooldown ends, a failed generation keeps answering with its error instead of calling the model again.
    this.sentenceTreeOnce ??= this.growSentenceTree().catch((error: unknown) => {
      this.failedAt = Date.now();
      throw error;
    });
    return this.sentenceTreeOnce;
  }

  private async growSentenceTree(): Promise<SentenceTreeView> {
    let lastError: unknown;
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      try {
        return SentenceTree.grow(await this.generator.generate()).toDTO();
      } catch (error) {
        if (error instanceof SentenceTreeUnavailable) throw error;
        lastError = error;
      }
    }
    throw new SentenceTreeUnavailable(`No usable sentence tree after ${ATTEMPTS} attempts`, { cause: lastError });
  }
}
