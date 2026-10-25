import type { Config } from 'jest';

// On demand only (`pnpm test:e2e`): drives an already running API over real HTTP, so `pnpm test` never picks it up.
const config: Config = {
  displayName: 'E2E',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json', diagnostics: { ignoreCodes: [151002] } }],
  },
  moduleNameMapper: { '^@Huemans/(.*)$': '<rootDir>/src/$1' },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/E2E/**/*.test.ts'],
  testTimeout: 60_000,
};

export default config;
