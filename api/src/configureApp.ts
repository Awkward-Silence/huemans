import { INestApplication } from '@nestjs/common';
import { DomainErrorFilter } from '@Huemans/Shared/Infrastructure/Http/DomainErrorFilter';
import { NotFoundErrorFilter } from '@Huemans/Shared/Infrastructure/Http/NotFoundErrorFilter';
import { config } from './config';

export function configureApp(app: INestApplication): INestApplication {
  // The web is served from another origin; the API is anonymous, so allowing any origin exposes nothing.
  app.enableCors({ origin: config.corsOrigin });
  app.useGlobalFilters(new DomainErrorFilter(), new NotFoundErrorFilter());
  app.enableShutdownHooks();
  return app;
}
