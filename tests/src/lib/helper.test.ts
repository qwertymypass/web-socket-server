import Helper from '../../../src/lib/helper';
import { IWsMessage } from '../../../src/types/interfaces';

const helper = new Helper();

describe('Get Routing Key', () => {
  test('Parse message with: resource, context', () => {
    const messgae: IWsMessage = {
      type: 'type',
      resource: 'resource',
      resourceID: '1',
      context: 'context',
      contextID: '2'
    };

    const routingkey = helper.getRoutingKey(messgae);

    expect(routingkey).toBeDefined();
    expect(routingkey).toBe('*.resource.1.context.2');
  });

  test('Parse empty message', () => {
    const messgae: IWsMessage = { type: 'type' };

    const routingkey = helper.getRoutingKey(messgae);

    expect(routingkey).toBeDefined();
    expect(routingkey).toBe('*.*.*.*.*');
  });
});

describe('Get text from content object', () => {
  const text = 'random text';
  const validObject = JSON.stringify({ content: { new: { data: { attributes: { text } } } } });

  test('Get value from object', () => {
    const value = helper.getText(validObject);

    expect(value).toBeDefined();
    expect(value).toBe(text);
  });

  test('Get undefined from object because invalid content object # empty object', () => {
    const value = helper.getText(JSON.stringify({}));
    expect(value).toBeUndefined();
  });
});

describe('Get MD5 Hash', () => {
  test('Valid md5 by text', () => {
    const md5Hash = '4e9630dac308c3b96111fb03995bcc4d';
    const text = 'for check md5 hash';
    const hash = helper.toMD5(text);

    expect(hash).toBeDefined();
    expect(hash).toBe(md5Hash);
  });

  test('Return empty argument', () => {
    const arg: any = undefined;
    const hash = helper.toMD5(arg);

    expect(hash).toBeUndefined();
    expect(hash).toBe(arg);
  });
});

describe('testin getByPath', () => {
  const value = 'value';
  const object = { key1: { key2: { key3: { value } } } };

  test('Get Value from object', () => {
    const returnsValue = helper.getByPath(object, 'key1.key2.key3.value');
    expect(returnsValue).toBeDefined();
    expect(returnsValue).toBe(value);
  });

  test('Get undefined from empty object # undefined', () => {
    const returnsValue = helper.getByPath(undefined, 'key1.key2.key3.value');
    expect(returnsValue).toBeUndefined();
  });
});
