import WebSocket from 'ws';
import amqp from 'amqplib';
import stackTrace from 'stack-trace';
import Helper from './helper';
import { logger } from './logger';
import { IRabbitmq } from '../types/interfaces';
import config from '../config';

export default class WSClient {
  private readonly wsID: string;
  private readonly ws: WebSocket;
  private readonly bindings: Set<string> = new Set();
  private readonly helper: Helper = new Helper();

  private readonly channel: amqp.Channel;
  private readonly exchange: string;
  private readonly assertOptions: { autoDelete: boolean; durable: boolean };
  private readonly isDebug: boolean;

  private ready = false;
  private close = false;
  private tag: string = null;

  constructor(wsID: string, ws: WebSocket, channel: amqp.Channel, rabbitMqOptions: IRabbitmq) {
    this.wsID = wsID;
    this.ws = ws;
    this.channel = channel;

    const { exchange, autoDelete, durable } = rabbitMqOptions;
    this.exchange = exchange;
    this.assertOptions = { autoDelete, durable };

    const logLevel = this.helper.getByPath(config, 'logSettings.level');
    this.isDebug = logLevel === 'debug' ? true : false;
  }

  public isReady(): boolean {
    return this.ready;
  }

  /**
   * Starting to consume
   * At first do assert for queue, then create consume
   */
  public async startConsume(): Promise<boolean | void> {
    const { ready, close, wsID, assertOptions } = this;
    if (ready || close) {
      return;
    }

    return this.channel
      .assertQueue(wsID, assertOptions)
      .then(() => this.consume())
      .catch((err: Error) => logger.error('Queue Asserting Error', { message: err.message, wsID }, stackTrace.get()));
  }

  /**
   * Adds new binding for this client
   * If binding already exists then returns from this func
   * @param {string} routingKey
   */
  public async addBinding(routingKey: string): Promise<void> {
    const { ready, close, bindings, wsID, exchange } = this;
    if (!ready || close || bindings.has(routingKey)) {
      return;
    }

    return this.channel
      .bindQueue(wsID, exchange, routingKey)
      .then(() => {
        bindings.add(routingKey);
        logger.debug('Binding by routing key', { wsID, routingKey });
      })
      .catch((err: Error) => logger.error('Binding queue Error', { message: err.message }, stackTrace.get()));
  }

  /**
   * Makes unbindings to this client then remove routing key from bindings
   * @param {string} routingKey
   */
  public async deleteBinding(routingKey: string): Promise<void> {
    const { ready, close, wsID, exchange, bindings } = this;
    if (!ready || close || !bindings.has(routingKey)) {
      return;
    }

    return this.channel
      .unbindQueue(wsID, exchange, routingKey)
      .then(() => {
        bindings.delete(routingKey);
        logger.debug('Unbinding by routing key', { wsID, routingKey });
      })
      .catch((err: Error) => logger.error('Unbinding Queue Error', { message: err.message }, stackTrace.get()));
  }

  /**
   * Sending message to WebSocket if this OPEN
   * @param {string} message
   */
  public sendMessage(message: string): void {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(message, (err: Error) => {
      if (err && err.message) {
        logger.error('Error by sending message', { message: err.message, wsID: this.wsID });
      }

      if (this.isDebug) {
        this.loggingMessage(message);
      }
    });
  }

  /**
   * Closes this client and clear bindings then deletes queue
   */
  public closeClient(): NodeJS.Immediate {
    const { wsID, tag } = this;
    this.close = true;

    return setImmediate(() => {
      this.clearBindings()
        .then(() => tag && this.channel.cancel(tag))
        .then(() => {
          this.channel.deleteQueue(wsID);
          logger.info('Queue has been deleted', { wsID });
        })
        .catch((err: Error) => logger.error('Delete Queue Error', { message: err.message, wsID }, stackTrace.get()));
    });
  }

  /**
   * Clears bindigns for this client
   */
  private async clearBindings(): Promise<void> {
    const { bindings, wsID, exchange } = this;
    if (!bindings.size) {
      return;
    }

    const toUnbinding = Array.from(bindings).map(rk => this.channel.unbindQueue(wsID, exchange, rk));
    return Promise.all(toUnbinding)
      .then(() => logger.info('Bindings have been cleared', { wsID }))
      .catch((err: Error) => logger.error('Clear bindings Error', { message: err.message, wsID }, stackTrace.get()));
  }

  /**
   * Consuming for this client
   */
  private consume(): boolean | void {
    const { ready, close, wsID } = this;
    if (ready || close) {
      return ready;
    }

    const cb = (data: amqp.ConsumeMessage) => {
      if (!data || (data && !data.content)) {
        return;
      }

      this.sendMessage(data.content.toString());
    };

    this.channel.consume(wsID, cb, { noAck: true }).then(response => (this.tag = response.consumerTag));
    this.ready = true;
    logger.info('Client is consuming', { wsID });

    return this.ready;
  }

  /**
   * Hash current text from content message to output
   * @param {string} message
   */
  private loggingMessage(message: string): void {
    const text = this.helper.getText(message);
    const hash = this.helper.toMD5(text);
    if (text && hash) {
      logger.debug('Current MD5 message hash', { wsID: this.wsID, hash });
    }
  }
}
