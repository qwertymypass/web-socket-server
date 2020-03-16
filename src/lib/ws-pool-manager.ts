import { logger } from './logger';
import WSClient from './ws-client';

export default class WSPoolManager {
  private pool: Map<string, WSClient>;

  constructor() {
    this.pool = new Map();

    this.startPingPongProtocol();
    this.startInformation();
  }

  /**
   * Add client to pool and returns this client
   * @param {string} wsID
   * @param {WSClient} client
   * @returns {WSClient}
   */
  public addClient(wsID: string, client: WSClient): WSClient {
    this.pool.set(wsID, client);
    return this.pool.get(wsID);
  }

  /**
   * Delete client from pool by wsID
   * @param {string} wsID
   */
  public deleteClient(wsID: string): boolean {
    return this.pool.delete(wsID);
  }

  /**
   * Starts Ping-Pong Protocol
   */
  private startPingPongProtocol(): void {
    setInterval(() => {
      for (const wsID of this.pool.keys()) {
        const client = this.pool.get(wsID);
        client.sendMessage(JSON.stringify({ type: 'ping', wsConnectionID: wsID }));
      }
    }, 5000).unref();
  }

  /**
   * Pool information to output
   */
  private startInformation(): void {
    setInterval(() => {
      const params = { connections: this.pool.size, queues: 0 };
      this.pool.forEach(client => client.isReady() && params.queues++);
      logger.info('WebSocket Pool information', { ...params });
    }, 100000).unref();
  }
}
