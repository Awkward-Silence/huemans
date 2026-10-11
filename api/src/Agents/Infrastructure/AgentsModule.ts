import { Module } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Agents/Application/ApplicationService';
import { SENTENCE_TREE_GENERATOR } from '@Huemans/Agents/Domain/Port/SentenceTreeGenerator';
import { SentenceTreeController } from './Http/SentenceTreeController';
import { GrowSentenceTreeOnBoot } from './Lifecycle/GrowSentenceTreeOnBoot';
import { MastraSentenceTreeGenerator } from './Llm/MastraSentenceTreeGenerator';

@Module({
  controllers: [SentenceTreeController],
  providers: [
    ApplicationService,
    { provide: SENTENCE_TREE_GENERATOR, useClass: MastraSentenceTreeGenerator },
    GrowSentenceTreeOnBoot,
  ],
})
export class AgentsModule {}
