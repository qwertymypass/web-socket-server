import WebSocket from 'ws';
import amqp from 'amqplib';
import stackTrace from 'stack-trace';
import { IncomingMessage } from 'http';
import { logger } from './lib/logger';
import RabbitMQClient from './lib/mq-client';
import WSPoolManager from './lib/ws-pool-manager';
import WSClient from './lib/ws-client';
import Helper from './lib/helper';
import { IWsMessage } from './types/interfaces';
import config from './config';

const { port, rabbitmq: rabbitmqOptions } = config;

const helper = new Helper();
const poolManager = new WSPoolManager();
const mqClient = new RabbitMQClient(rabbitmqOptions);

if (!module.parent) {
  mqClient.once('ready', (_, channel: amqp.Channel) => {
    const wss = new WebSocket.Server({ clientTracking: true, port });
    logger.info('WebSocket Server listeting', { port });
    wss.on('connection', connectionCallback.bind(this, channel));
  });
}

/**
 * Callback for connection WebSockets
 * @param {WebSocket} ws
 * @param {IncomingMessage} req
 */
function connectionCallback(mqChannel: amqp.Channel, ws: WebSocket, req: IncomingMessage): void {
  const wsID = req.headers['sec-websocket-key'].toString();
  const client = new WSClient(wsID, ws, mqChannel, rabbitmqOptions);
  logger.info('New client is connect', { wsID });
  poolManager.addClient(wsID, client);

  ws.on('message', async (rawMessage: string) => {
    const message = helper.parseMessgae(rawMessage) as IWsMessage;
    if (!message) {
      return;
    }

    if (!client.isReady()) {
      await client.startConsume();
    }

    const routingKey = helper.getRoutingKey(message);
    if (message.type === 'subscribe') {
      client.addBinding(routingKey);
    } else if (message.type === 'unsubscribe') {
      client.deleteBinding(routingKey);
    }
  });

  ws.on('close', () => closingClient.call(this));
  ws.on('error', (err: Error) => closingClient.call(this, err));

  /**
   * Close and delete client from pool and logging Error if there is
   * @param {Error?} err
   */
  function closingClient(err?: Error): void {
    if (err && err.message) {
      logger.error('Socket Error', { message: err.message, wsID }, stackTrace.get());
    }

    client.closeClient();
    poolManager.deleteClient(wsID);
  }
}
