import winston from 'winston';
import { ILogger, ILogSettings, ILoggerFunction, ILoggerData, ILoggerLevel } from '@/src/types/interfaces';

const { combine, timestamp, json, colorize, align, printf, simple } = winston.format;

export default class Logger implements ILogger {
  private level: string;
  private format: any;
  private levelNumber: ILoggerLevel;
  private colorize: boolean;
  private formats: any;

  constructor(options?: ILogSettings) {
    this.formats = { 1: this.customFormat, 2: this.jsonFormat };
    this.levelNumber = {
      error: 1,
      warn: 2,
      info: 3,
      debug: 4
    };

    const keys = options ? Object.keys(options) : [];
    this.level = keys.includes('level') ? options.level : 'info';
    this.format = keys.includes('format') ? this.getFormat(options.format) : this.getFormat(1);
    this.colorize = keys.includes('colorize') && options.colorize;
  }

  public error: ILoggerFunction = (message, params) => this.print('error', message, params);
  public warn: ILoggerFunction = (message, params) => this.print('warn', message, params);
  public info: ILoggerFunction = (message, params) => this.print('info', message, params);
  public debug: ILoggerFunction = (message, params) => this.print('debug', message, params);

  /**
   * Checks level and print log to output
   * @param {string} level
   * @param {string} message
   * @param {object} params
   */
  private print(level: string, message: string, params?: object) {
    if (!this.checkLevel(level)) {
      return;
    }

    const logData: ILoggerData = { level, message, params };
    this.printLog(logData, [new winston.transports.Console()]);
  }

  /**
   * Returns winston logger with custome format
   * @param {any[]} transports
   * @returns {winston.Logger}
   */
  private logger(transports: any[]): winston.Logger {
    return winston.createLogger({
      format: this.format(),
      level: 'debug',
      transports
    });
  }

  /**
   * Makes string for output
   * @param {any} info
   * @returns {string}
   */
  private customPrintf(info: any): string {
    const { level, message, params, timestamp: ts } = info;

    const tsString = ts.slice(0, 19).replace('T', ' ');
    const paramsString = Object.keys(params)
      .map(key => `${key} -> ${params[key]}`)
      .join(' :: ');

    return `${tsString} [${level}]: ${message} ${paramsString}`;
  }

  private checkLevel = (level: string) => this.levelNumber[this.level] >= this.levelNumber[level];
  private printLog = (logData: ILoggerData, transports: any[]) => this.logger(transports).log(logData);
  private customFormat = () => combine(this.isColorize(), timestamp(), align(), printf(this.customPrintf));
  private jsonFormat = () => combine(timestamp(), json());
  private isColorize = () => (this.colorize ? colorize() : simple());
  private getFormat = (num: number) => this.formats[num] || this.formats[1];
}
