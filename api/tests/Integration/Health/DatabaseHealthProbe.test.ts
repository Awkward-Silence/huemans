import { TestingModule } from '@nestjs/testing';
import { DatabaseHealthProbe } from '../../../apps/api/src/Health/DatabaseHealthProbe';
import { bootIntegration } from '../../Support/integration';

describe('DatabaseHealthProbe', () => {
  let module: TestingModule;
  let probe: DatabaseHealthProbe;

  beforeAll(async () => {
    module = await bootIntegration({ providers: [DatabaseHealthProbe] });
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    probe = module.get(DatabaseHealthProbe);
  });

  it('testReportsDatabaseUpWhenReachable', async () => {
    expect(await probe.isUp()).toBe(true);
  });
});
