import { INestApplication } from '@nestjs/common';
import { DomainErrorFilter } from '@Huemans/Shared/Infrastructure/Http/DomainErrorFilter';

export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalFilters(new DomainErrorFilter());
  app.enableShutdownHooks();
  return app;
}
