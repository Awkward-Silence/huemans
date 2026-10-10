import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { bootFunctional } from '../../Support/functional';

describe('CORS', () => {
  let app: INestApplication;
  let origin: string;

  beforeAll(async () => {
    app = await bootFunctional();
    origin = 'http://localhost:5173';
  });

  afterAll(async () => {
    await app.close();
  });

  it('testAllowsTheWebToReadResponsesFromAnotherOrigin', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/health')
      .set('Origin', origin);

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('testAnswersThePreflight', async () => {
    const response = await request(app.getHttpServer() as App)
      .options('/events')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });
});
