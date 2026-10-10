import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseHealthProbe {
  constructor(private readonly em: EntityManager) {}

  async isUp(): Promise<boolean> {
    try {
      await this.em.getConnection().execute('select 1');
      return true;
    } catch {
      return false;
    }
  }
}
