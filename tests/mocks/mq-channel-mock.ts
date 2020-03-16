export default {
  bindQueue: () => Promise.resolve(),
  unbindQueue: () => Promise.resolve(),
  deleteQueue: () => Promise.resolve(),
  assertQueue: () => Promise.resolve(),
  consume: () => Promise.resolve({ consumerTag: 'qwe' })
};
