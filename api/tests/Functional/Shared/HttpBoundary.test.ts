import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { z } from 'zod';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';
import { Uuid } from '@Huemans/Shared/Domain/ValueObject/Uuid';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';
import { bootFunctional, postJson } from '../../Support/functional';

class TeamId extends Uuid {}
class TeamName extends StringValueObject {}

const CreateTeamPayload = z.object({ id: z.string(), name: z.string().min(1) });
type CreateTeamPayload = z.infer<typeof CreateTeamPayload>;

@Controller('test-teams')
class TestTeamsController {
  @Post()
  create(@Body(new ZodValidationPipe(CreateTeamPayload)) payload: CreateTeamPayload): { id: string; name: string } {
    return { id: new TeamId(payload.id).value, name: new TeamName(payload.name).value };
  }
}

describe('HTTP boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootFunctional({ controllers: [TestTeamsController] });
  });

  afterAll(async () => {
    await app.close();
  });

  it('testAcceptsAValidPayload', async () => {
    const id = TeamId.random().value;

    const response = await postJson(app, '/test-teams', { id, name: 'Reds' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id, name: 'Reds' });
  });

  it('testRejectsAnInvalidPayloadWith400', async () => {
    const response = await postJson(app, '/test-teams', { id: TeamId.random().value, name: '' });

    expect(response.status).toBe(400);
    expect((response.body as { issues: unknown[] }).issues).toEqual([expect.objectContaining({ path: 'name' })]);
  });

  it('testTurnsADomainInvalidArgumentInto400', async () => {
    const response = await postJson(app, '/test-teams', { id: 'not-a-uuid', name: 'Reds' });

    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toContain('TeamId');
  });
});
