import baseConfig from './jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  testMatch: ['**/tests/performance/**/*.performance.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: false,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.benchmark.json' }],
  },
};

export default config;
