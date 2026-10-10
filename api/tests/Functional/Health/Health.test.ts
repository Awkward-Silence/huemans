import { INestApplication } from '@nestjs/common';
import { DatabaseHealthProbe } from '@Huemans/Health/DatabaseHealthProbe';
import { bootFunctional, getJson } from '../../Support/functional';

describe('GET /health', () => {
  let app: INestApplication;

  afterEach(async () => {
    await app.close();
  });

  it('testReportsOkWhenDatabaseIsUp', async () => {
    app = await bootFunctional();

    const response = await getJson(app, '/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('testReportsUnavailableWhenDatabaseIsDown', async () => {
    app = await bootFunctional({
      overrides: [{ provide: DatabaseHealthProbe, useValue: { isUp: () => Promise.resolve(false) } }],
    });

    const response = await getJson(app, '/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'down' });
  });
});
