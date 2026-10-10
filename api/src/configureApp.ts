import { INestApplication } from '@nestjs/common';
import { DomainErrorFilter } from '@Huemans/Shared/Infrastructure/Http/DomainErrorFilter';
import { NotFoundErrorFilter } from '@Huemans/Shared/Infrastructure/Http/NotFoundErrorFilter';

export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalFilters(new DomainErrorFilter(), new NotFoundErrorFilter());
  app.enableShutdownHooks();
  return app;
}
