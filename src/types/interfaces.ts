export interface IConfig {
  port: number;
  logSettings: ILogSettings;
  rabbitmq: IRabbitmq;
}

export interface ILogSettings {
  level: string;
  format: number;
  colorize: boolean;
  transports?: string;
  filename?: string;
}

export interface ILogger {
  info: ILoggerFunction;
  debug: ILoggerFunction;
  error: ILoggerFunction;
  warn: ILoggerFunction;
}

export type ILoggerFunction = (message: string, params?: object, trace?: any, label?: string) => void;

export interface ILogData {
  level: string;
  message: string;
  label?: string;
  params?: object;
}

export interface ILoggerData {
  level: string;
  message: string;
  params?: object;
}

export interface ILoggerLevel {
  [level: string]: number;
}

export interface IParseStack {
  fileName: string;
  line: number;
}

export interface ILogLevel {
  [level: string]: number;
}

export interface IRabbitmq {
  url: string;
  exchange: string;
  durable: boolean;
  autoDelete: boolean;
}

export interface IWsMessage {
  type: string;
  resource?: string;
  resourceID?: string;
  contextType?: string;
  contextID?: string;
  wsConnectionID?: string;
  method?: string;
}
