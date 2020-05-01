export interface IConfig {
  port: number;
  rabbitmq: IRabbitmq;
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
  context?: string;
  contextID?: string;
  method?: string;
}
