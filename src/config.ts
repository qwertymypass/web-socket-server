import fs from 'fs';
import yaml from 'js-yaml';
import { resolve } from 'path';
import { IConfig } from '@/src/types/interfaces';

const configurationPath = process.env.CONFIGURATION_PATH || '';
const configFileName = process.env.CONFIG_FILE_NAME || 'config.yaml';

const pathToConfigfile = resolve(`${process.cwd()}${configurationPath}/${configFileName}`);

/* tslint:disable:no-console*/
if (!fs.existsSync(pathToConfigfile)) {
  console.error('Error: Config file is missing!');
  process.exit(1);
}

const configFile: string = fs.readFileSync(pathToConfigfile, 'utf8');
const config: IConfig = yaml.safeLoad(configFile);

export default config as IConfig;
