import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';

class Pinged extends DomainEvent {
  static readonly EVENT_NAME = 'test.pinged';

  constructor(aggregateId: string) {
    super({ eventName: Pinged.EVENT_NAME, aggregateId });
  }

  toPrimitives(): Record<string, unknown> {
    return {};
  }
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe('InMemoryEventDispatcher', () => {
  let dispatcher: InMemoryEventDispatcher;
  let calls: string[];

  beforeEach(() => {
    dispatcher = new InMemoryEventDispatcher();
    calls = [];
  });

  it('testRunsSubscribersInOrderAndWaitsForThem', async () => {
    dispatcher.subscribe(Pinged.EVENT_NAME, async (event) => {
      await tick();
      calls.push(`first:${event.aggregateId}`);
    });
    dispatcher.subscribe(Pinged.EVENT_NAME, (event) => {
      calls.push(`second:${event.aggregateId}`);
      return Promise.resolve();
    });

    await dispatcher.dispatchAll([new Pinged('a'), new Pinged('b')]);

    expect(calls).toEqual(['first:a', 'second:a', 'first:b', 'second:b']);
  });

  it('testIgnoresEventsWithoutSubscribers', async () => {
    await expect(dispatcher.dispatchAll([new Pinged('a')])).resolves.toBeUndefined();
  });
});
