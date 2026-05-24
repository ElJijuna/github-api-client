import baseConfig from './jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  testMatch: ['**/tests/performance/**/*.performance.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: false,
};

export default config;
