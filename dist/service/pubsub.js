"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventBus_1 = __importDefault(require("../driver/eventBus"));
const googlePubSub_1 = __importDefault(require("../driver/googlePubSub"));
const subscription_1 = __importDefault(require("./subscription"));
class PubSubService {
    constructor() {
        this.initDriver();
        this.initClient();
        this.bind(this);
    }
    bind(instance) {
        this.subscribe = this.subscribe.bind(instance);
        this.publish = this.publish.bind(instance);
    }
    initDriver() {
        if (this.syncDriverIsEnabled()) {
            PubSubService.driver = 'synchronous';
        }
        else {
            PubSubService.driver = 'google';
        }
    }
    syncDriverIsEnabled() {
        return ((process.env.PUBSUB_DRIVER &&
            process.env.PUBSUB_DRIVER.toLowerCase() == 'synchronous') ||
            false);
    }
    initClient() {
        if (PubSubService.driver === 'synchronous') {
            PubSubService.client = eventBus_1.default.getInstance();
        }
        else {
            PubSubService.client = googlePubSub_1.default.getInstance();
        }
    }
    static getInstance() {
        if (!PubSubService.instance) {
            PubSubService.instance = new PubSubService();
        }
        return PubSubService.instance;
    }
    async publish(topic, message) {
        this.validate(topic, message);
        if (this.shouldStartSynchronousSubscriptions()) {
            await this.startSubscriptions();
        }
        return await this.getClient().publish(topic, message);
    }
    shouldStartSynchronousSubscriptions() {
        return (PubSubService.driver === 'synchronous' && PubSubService.status !== 'ready');
    }
    getClient() {
        return PubSubService.client;
    }
    getSubscribers() {
        return subscription_1.default.getSubscribers();
    }
    async startSubscriptions() {
        if (PubSubService.status === 'ready')
            return;
        if (PubSubService.driver !== 'synchronous')
            subscription_1.default.loadSubscriptionService();
        for (let subscription of subscription_1.default.getSubscribers())
            await this.subscribe(subscription);
        PubSubService.status = 'ready';
    }
    validate(topic, message) {
        topic.validateTopic(topic.getName());
        topic.validateMessage(message);
    }
    async subscribe(subscription) {
        return this.getClient().subscribe(subscription);
    }
    async getAllSubscriptions() {
        return this.getClient().getAllSubscriptions();
    }
}
exports.default = PubSubService;
PubSubService.status = 'pending';