import WSClient from '../../../src/lib/ws-client';
import mqChannelMock from '../../mocks/mq-channel-mock';
import WebSocket from 'ws';
import uniqid from 'uniqid';

const ws = {} as WebSocket;
const mqChannel = mqChannelMock as any;
const rabbitMqOptions = {
  url: 'url',
  exchange: 'exchange',
  durable: true,
  autoDelete: false
};

const wsConnectionID = uniqid();
const routingkey = uniqid();

const client = new WSClient(wsConnectionID, ws, mqChannel, rabbitMqOptions);

test('Verification of default values', () => {
  expect(client).toHaveProperty('wsID');
  expect(client).toHaveProperty('ws');
  expect(client).toHaveProperty('channel');
  expect(client).toHaveProperty('bindings');
  expect(client).toHaveProperty('ready');
  expect(client).toHaveProperty('close');
  expect(client).toHaveProperty('exchange');
  expect(client).toHaveProperty('assertOptions');
});

test('Client must be is not ready', () => {
  expect(client).toHaveProperty('isReady');
  expect(client.isReady()).toBe(false);
});

test('Start consuming then client is ready', async () => {
  expect(client).toHaveProperty('startConsume');
  await client.startConsume();
  expect(client.isReady()).toBe(true);
});

test('Adding bindigns', async () => {
  expect(client).toHaveProperty('addBinding');
  await client.addBinding(routingkey);

  const { bindings } = client as any;

  expect(bindings).toBeDefined();
  expect(bindings.size).toBe(1);
  expect(bindings.has(routingkey)).toBe(true);
});

test('Delete binding', async () => {
  expect(client).toHaveProperty('deleteBinding');
  await client.deleteBinding(routingkey);

  const { bindings } = client as any;

  expect(bindings).toBeDefined();
  expect(bindings.size).toBe(0);
  expect(bindings.has(routingkey)).toBe(false);
});

test('Closing client', async () => {
  expect(client).toHaveProperty('closeClient');
  client.closeClient();

  const { close } = client as any;

  expect(close).toBeDefined();
  expect(close).toBe(true);
});
