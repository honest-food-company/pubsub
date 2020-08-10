const path = require('path');
const exec = require('child_process').exec;
import fs from 'fs';
require('dotenv').config({ path: require('find-config')('.env') });
import SubscriptionService from '../src/service/subscription';

const mockPubSub = jest.fn();

process.env.PUBSUB_ROOT_DIR = path.resolve(__dirname, 'pubsub');

jest.mock('@google-cloud/pubsub', () => ({
  __esModule: true,
  PubSub: mockPubSub,
}));

const mockPublish = jest.fn();
jest.mock('../src/service/pubsub', (): any => ({
  __esModule: true,
  default: class {
    public static getInstance(): any {
      console.log('getting instance');
      return new this();
    }
    public publish(): any {
      return mockPublish();
    }
  },
}));

function cli(args: any, cwd: string | null = null): any {
  return new Promise((resolve): any => {
    exec(
      `node ${path.resolve('./dist/cli/subscriptions')} ${args.join(' ')}`,
      { cwd },
      (error: any, stdout: any, stderr: any): any => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      },
    );
  });
}
describe('subscriptions cli', (): any => {
  it('should find config', async (): Promise<any> => {
    if (
      process.env.PUBSUB_ROOT_DIR &&
      !process.env.PUBSUB_ROOT_DIR.match(/__tests__/)
    ) {
      console.log(
        'to run tests, you must set your PUBSUB_ROOT_DIR .env variable to point to __tests__/pubsub',
      );
      process.exit(1);
    }
  });

  it('should list subscriptions', async (): Promise<any> => {
    const result = await cli(['list']);
    expect(JSON.stringify(result)).toContain('test-topic');
    expect(JSON.stringify(result)).toContain('v2-subscription');
  });
  it('should list subscriptions', async (): Promise<any> => {
    const subscriptions = SubscriptionService.getSubscribers();
    expect(subscriptions.length).toEqual(7);
  });
});
