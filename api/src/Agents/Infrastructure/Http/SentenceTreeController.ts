import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import type { SentenceTreeResponse } from '../../../../contracts/sentenceTree';
import { ApplicationService } from '@Huemans/Agents/Application/ApplicationService';
import { SentenceTreeUnavailable } from '@Huemans/Agents/Domain/SentenceTreeUnavailable';

@Controller('sentence-tree')
export class SentenceTreeController {
  constructor(private readonly service: ApplicationService) {}

  // Waits for the generation when it is still running; web/ gives up on its own and uses its bundled tree.
  @Get()
  async sentenceTree(): Promise<SentenceTreeResponse> {
    try {
      return await this.service.sentenceTree();
    } catch (error) {
      if (error instanceof SentenceTreeUnavailable) {
        throw new ServiceUnavailableException(error.message);
      }
      throw error;
    }
  }
}
