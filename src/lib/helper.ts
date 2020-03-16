import crypto from 'crypto';
import { logger } from './logger';
import { IWsMessage } from '../types/interfaces';

export default class Helper {
  /**
   * Return 'IWsMessage' after parse data from client
   * @param {string} data
   * @returns {IWsMessage}
   */
  public parseMessgae(data: string): IWsMessage | JSON {
    try {
      return JSON.parse(data);
    } catch (err) {
      logger.warn('Could not parse subscribing ws message', { message: err.message, data });
      return null;
    }
  }

  /**
   * Returns Routing key by message
   * @param {IWsMessage} message
   * @returns {string}
   */
  public getRoutingKey(message: IWsMessage): string {
    const { method = '*', resource = '*', resourceID = '*', contextType = '*', contextID = '*' } = message;
    return `${method}.${resource}.${resourceID}.${contextType}.${contextID}`;
  }

  /**
   * Return text from Content messsage
   * @param {string} rawData
   * @returns {string | undefined}
   */
  public getText(rawData: string): string | undefined {
    const object = this.parseMessgae(rawData);
    return this.getByPath(object, 'content.new.data.attributes.text');
  }

  /**
   * Returns inner value by path by match key1.key2.key3 (key and dot)
   * @param {any} object
   * @param {string} path
   * @returns {string | undefined}
   */
  public getByPath(object: any = {}, path: string): string | undefined {
    const value = path.split('.').reduce((accum, current) => (accum[current] ? accum[current] : accum), object);
    return !value || typeof value === 'object' ? undefined : String(value);
  }

  /**
   * Raw data to MD5 hash
   * @param {string} data
   * @returns {string}
   */
  public toMD5(data: string): string {
    if (!data) {
      return data;
    }

    return crypto
      .createHash('md5')
      .update(data)
      .digest('hex');
  }
}
