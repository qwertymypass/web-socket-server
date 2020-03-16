module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/(?!@foo)'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1'
  },
  testEnvironment: 'node',
  testRegex: '/tests/.*.test.(js|ts|tsx)$',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@foo)']
};