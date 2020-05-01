import amqp from 'amqplib';
import logger from 'very-simple-logger';
import { IRabbitmq } from '@/src/types/interfaces';
import { EventEmitter } from 'events';

export default class RabbitMQClient extends EventEmitter {
  private readonly url: string;
  private readonly exchange: string;

  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(rabbitMqOptions: IRabbitmq) {
    super();

    this.url = rabbitMqOptions.url;
    this.exchange = rabbitMqOptions.exchange;

    this.createConnection();
  }

  /**
   * Object RabbitMQClient initialization
   */
  private async createConnection(): Promise<void> {
    try {
      const { url, exchange } = this;
      this.connection = await amqp.connect(url, { heartbeat: 60 });

      this.connection.on('close', this.errorMqConnection);
      this.connection.on('error', this.errorMqConnection);

      this.channel = await this.connection.createChannel();
      logger.info('Connect to RabbitMQ successfully', { url, exchange });

      this.emit('ready', this.connection, this.channel);
    } catch (err) {
      logger.error('Field connect to RabbitMQ', { message: err.message });
      process.exit(1);
    }
  }

  /**
   * Callback for close or error MQ
   * @param {Error} err
   */
  private async errorMqConnection(err: Error): Promise<void> {
    logger.error('Error message from RabbitMQ', { message: err.message, error: err });
    process.exit(1);
  }
}
