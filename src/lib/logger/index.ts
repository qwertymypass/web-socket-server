import config from '../../config';
import Logger from './logger';

export const logger: Logger = new Logger(config.logSettings);
