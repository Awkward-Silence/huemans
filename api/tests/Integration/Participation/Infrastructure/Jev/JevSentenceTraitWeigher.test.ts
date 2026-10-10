import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { SentenceAnswer } from '@Huemans/Participation/Domain/ValueObject/SentenceAnswer';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import {
  JevSentenceTraitWeigher,
  JevSettings,
} from '@Huemans/Participation/Infrastructure/Jev/JevSentenceTraitWeigher';
import { config } from '@Huemans/config';

const SENTENCE = new SentenceAnswer('Finish the sentence: I ...', 'I secretly write love letters to my toaster');

function weightsOf(traits: SentenceTraits): Record<string, number> {
  return Object.fromEntries(traits.all().map(({ trait, weight }) => [trait.value, weight.value]));
}

// A local stand-in for Jev's HTTP API, so the adapter's wire format and failure handling are tested offline.
describe('JevSentenceTraitWeigher against a stub server', () => {
  let server: Server;
  let respond: (request: IncomingMessage, body: unknown, response: ServerResponse) => void;
  let settings: JevSettings;

  beforeAll(async () => {
    server = createServer((request, response) => {
      let raw = '';
      request.on('data', (chunk: Buffer) => (raw += chunk.toString()));
      request.on('end', () => respond(request, JSON.parse(raw), response));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    const { port } = server.address() as AddressInfo;
    settings = {
      apiKey: 'test-key',
      model: 'jev-latest',
      url: `http://127.0.0.1:${port}/v1/systemone`,
      timeoutMs: 300,
    };
  });

  function answerWith(probabilities: Record<string, number>, status = 200) {
    return (_request: IncomingMessage, _body: unknown, response: ServerResponse) => {
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ model: 'jev-1.13.0', answers: { trait: { type: 'choice', probabilities } } }));
    };
  }

  it('testAsksOneChoiceOverTheTraitsWithTheBearerKey', async () => {
    let seen: { authorization?: string; body?: Record<string, unknown> } = {};
    respond = (request, body, response) => {
      seen = { authorization: request.headers.authorization, body: body as Record<string, unknown> };
      answerWith({ romantic: 1 })(request, body, response);
    };

    await new JevSentenceTraitWeigher(settings).weigh(SENTENCE);

    expect(seen.authorization).toBe('Bearer test-key');
    expect(seen.body).toMatchObject({
      model: 'jev-latest',
      state: { question: SENTENCE.question, answer: SENTENCE.answer },
      questions: { trait: { type: 'choice' } },
    });
    const criteria = (seen.body as { questions: { trait: { criteria: object } } }).questions.trait.criteria;
    expect(Object.keys(criteria)).toHaveLength(33);
  });

  it('testTurnsTheProbabilitiesIntoOneAnswerOfWeight', async () => {
    respond = answerWith({ romantic: 0.6, dramatic: 0.38, curious: 0.02, unknown: 0.5 });

    const weights = weightsOf(await new JevSentenceTraitWeigher(settings).weigh(SENTENCE));

    expect(Object.keys(weights).sort()).toEqual(['dramatic', 'romantic']);
    expect(weights.romantic + weights.dramatic).toBeCloseTo(1);
  });

  it('testAnErrorStatusAddsNoTraits', async () => {
    respond = answerWith({ romantic: 1 }, 529);

    expect((await new JevSentenceTraitWeigher(settings).weigh(SENTENCE)).all()).toEqual([]);
  });

  it('testAMalformedResponseAddsNoTraits', async () => {
    respond = (_request, _body, response) => response.end('{"answers": {}}');

    expect((await new JevSentenceTraitWeigher(settings).weigh(SENTENCE)).all()).toEqual([]);
  });

  it('testASlowJevAddsNoTraitsInsteadOfWaiting', async () => {
    respond = (request, body, response) =>
      setTimeout(() => answerWith({ romantic: 1 })(request, body, response), 2_000);

    const started = Date.now();
    const traits = await new JevSentenceTraitWeigher(settings).weigh(SENTENCE);

    expect(traits.all()).toEqual([]);
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  it('testWithoutAKeyItNeverCallsJev', async () => {
    respond = jest.fn();

    const traits = await new JevSentenceTraitWeigher({ ...settings, apiKey: undefined }).weigh(SENTENCE);

    expect(traits.all()).toEqual([]);
    expect(respond).not.toHaveBeenCalled();
  });
});

// Calls the real Jev, so it runs only with JEV_API_KEY in .env.test (or CI's secret written there).
const withKey = config.jev.apiKey ? describe : describe.skip;

withKey('JevSentenceTraitWeigher against Jev', () => {
  it('testWeighsARealSentence', async () => {
    const traits = await new JevSentenceTraitWeigher({ ...config.jev, timeoutMs: 5_000 }).weigh(SENTENCE);

    expect(traits.all().length).toBeGreaterThan(0);
    expect(traits.all().reduce((sum, { weight }) => sum + weight.value, 0)).toBeCloseTo(1);
  }, 10_000);
});
