"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscriber_1 = __importDefault(require("./subscriber"));
class SubscriberV2 extends subscriber_1.default {
    constructor(subscriberObject) {
        super();
        this.subscriberObject = subscriberObject;
        this.metadata = subscriberObject;
    }
    async init() {
        var _a, _b;
        ((_a = this.subscriberObject) === null || _a === void 0 ? void 0 : _a.init) && ((_b = this.subscriberObject) === null || _b === void 0 ? void 0 : _b.init());
    }
    async handleMessage(message) {
        var _a, _b;
        ((_a = this.subscriberObject) === null || _a === void 0 ? void 0 : _a.handleMessage) && ((_b = this.subscriberObject) === null || _b === void 0 ? void 0 : _b.handleMessage(message));
    }
    static from(subscriber, version) {
        switch (version) {
            case 'v1': {
                const subscriberClass = subscriber;
                return class extends subscriberClass {
                    constructor() {
                        super(...arguments);
                        this.metadata = {
                            topicName: subscriber.topicName,
                            subscriptionName: subscriber.subscriptionName,
                            description: subscriber.description,
                            options: {
                                ackDeadline: subscriber.ackDeadlineSeconds,
                                flowControl: {
                                    maxMessages: subscriber.maxMessages,
                                },
                            },
                        };
                    }
                    static from(subscriberClass, version) {
                        return SubscriberV2.from(subscriberClass, version);
                    }
                    static getSubscriberVersion(subscriberClass) {
                        return SubscriberV2.getSubscriberVersion(subscriberClass);
                    }
                };
            }
            case 'v2':
                return subscriber;
            case 'v3':
                const subscriberObject = subscriber;
                return class extends SubscriberV2 {
                    constructor() {
                        super(subscriberObject);
                    }
                };
            default:
                return subscriber;
        }
    }
    static getSubscriberVersion(subscriber) {
        if (typeof subscriber === 'function') {
            try {
                const subscriberInstance = new subscriber();
                if (Object.getOwnPropertyNames(subscriberInstance).includes('metadata')) {
                    return 'v2';
                }
                else {
                    return 'v1';
                }
            }
            catch (e) {
                return 'v1';
            }
        }
        if (typeof subscriber === 'object') {
            return 'v3';
        }
        throw new Error('Invalid Subscriber: Unable to determine Subscriber Version.');
    }
}
exports.default = SubscriberV2;