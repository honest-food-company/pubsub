import PubSubService from '../service/pubsub';

/**
 * extend this interface to define your own payload
 * e.g.
 * ```typescript
 *     interface YourTopicPayload extends Payload {
 *        id: number;
 *        action: string;
 *     }
 * ```
 */
export interface Payload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _timestamp?: string;
}

interface NamedTopic {
  readonly name: string;
}

export default class Topic implements NamedTopic {
  public readonly name: string = '';
  protected mq: PubSubService;
  public constructor() {
    this.mq = PubSubService.getInstance();
  }
  /**
   * @todo implement message validation logic. tried to link Topic and Message using static name methods, but hit a wall with subclass static inheritance typescript issues
   * @param message Message
   */
  public validateMessage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: Payload,
  ): void {
    message;
  }

  public async publish<T extends Payload>(message: T): Promise<string> {
    this.validateTopic(this.getName());
    this.validateMessage(message);
    return this.mq.publish(this, {
      ...message,
      _timestamp: new Date().toISOString(),
    });
  }

  public getName(): string {
    return this.name;
  }

  public validateTopic(name: string): void {
    if (!name || name.length <= 6) {
      throw new Error('Invalid Topic Name!');
    }
  }
}