/* eslint-disable */
import type { Config } from 'jest';

const config: Config = {
  displayName: 'flowpilot-activepieces-client',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/activepieces-client',
};

export default config;
