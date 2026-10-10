import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseHealthProbe } from './DatabaseHealthProbe';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseHealthProbe) {}

  @Get()
  async check(): Promise<{ status: 'ok'; database: 'up' }> {
    if (!(await this.database.isUp())) {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return { status: 'ok', database: 'up' };
  }
}
