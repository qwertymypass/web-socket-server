/* tslint:disable:no-namespace interface-name */
declare namespace NodeJS {
  interface Global {
    config: import('./interfaces').IConfig;
  }
}

declare module 'js-yaml';
