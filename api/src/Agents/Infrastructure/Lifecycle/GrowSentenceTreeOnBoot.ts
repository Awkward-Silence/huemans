import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Agents/Application/ApplicationService';
import { config } from '@Huemans/config';

/** Starts the generation in the background at boot, so the tree is usually ready before the first attendee asks. */
@Injectable()
export class GrowSentenceTreeOnBoot implements OnApplicationBootstrap {
  private readonly logger = new Logger(GrowSentenceTreeOnBoot.name);

  constructor(private readonly service: ApplicationService) {}

  onApplicationBootstrap(): void {
    if (!config.growSentenceTreeOnBoot) return;
    if (!config.openAi.apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set: GET /sentence-tree answers 503 and web/ uses its bundled tree');
      return;
    }
    const startedAt = Date.now();
    this.service.sentenceTree().then(
      () => this.logger.log(`Sentence tree ready in ${Date.now() - startedAt} ms`),
      (error: unknown) => this.logger.warn(`Sentence tree generation failed: ${String(error)}`),
    );
  }
}
