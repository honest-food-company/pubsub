require('dotenv').config({ path: require('find-config')('.env') });
import PubSubService from '../src/service/pubsub';
import exampleTopic, { Payload } from './pubsub/topics/example.topic';

const mockPublish = jest.fn().mockResolvedValue('testid');

jest.mock('../src/service/pubsub', (): any => ({
  __esModule: true,
  default: class {
    public static getInstance(): any {
      return new this();
    }
    public publish(): Promise<string> {
      return mockPublish();
    }
  },
}));

describe('topics', (): void => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should publish to pubsub', async (): Promise<void> => {
    const spy = jest.spyOn(PubSubService, 'getInstance');
    const topic = new exampleTopic();
    await topic.publish<Payload>({ data: 'test' });
    expect(spy).toBeCalledTimes(1);
    expect(mockPublish).toBeCalledTimes(1);
  });

  it('Expect publish to return a string with the messageId', async (): Promise<
    void
  > => {
    const spy = jest.spyOn(PubSubService, 'getInstance');
    const topic = new exampleTopic();
    const data = await topic.publish<Payload>({ data: 'test' });
    expect(spy).toBeCalledTimes(1);
    expect(data).toBe('testid');
    expect(mockPublish).toBeCalledTimes(1);
  });

  it('Should test retry config to be the default one', async (): Promise<
    void
  > => {
    const spy = jest.spyOn(PubSubService.prototype, 'publish');
    const topic = new exampleTopic();
    const data = await topic.publish<Payload>({ data: 'test' });
    expect(data).toBe('testid');
    expect(spy).toBeCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        backoffSettings: {
          initialRetryDelayMillis: 100,
          initialRpcTimeoutMillis: 5000,
          maxRetryDelayMillis: 60000,
          maxRpcTimeoutMillis: 600000,
          retryDelayMultiplier: 1.3,
          rpcTimeoutMultiplier: 1,
          totalTimeoutMillis: 600000,
        },
        retryCodes: [10, 1, 4, 13, 8, 14, 2],
      }),
    );
  });
  it('Should test retry config to be the updated retry config one', async (): Promise<
    void
  > => {
    const spy = jest.spyOn(PubSubService.prototype, 'publish');
    const topic = new exampleTopic();
    const data = await topic.publish<Payload>(
      { data: 'test' },
      { backoffSettings: { initialRetryDelayMillis: 500 } },
    );
    expect(data).toBe('testid');
    expect(spy).toBeCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        backoffSettings: {
          initialRetryDelayMillis: 500,
          initialRpcTimeoutMillis: 5000,
          maxRetryDelayMillis: 60000,
          maxRpcTimeoutMillis: 600000,
          retryDelayMultiplier: 1.3,
          rpcTimeoutMultiplier: 1,
          totalTimeoutMillis: 600000,
        },
        retryCodes: [10, 1, 4, 13, 8, 14, 2],
      }),
    );
  });
});
