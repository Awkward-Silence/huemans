import type { Config } from 'jest';

const shared = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
  moduleNameMapper: { '^@Huemans/(.*)$': '<rootDir>/src/$1' },
  testEnvironment: 'node',
} satisfies Config;

const config: Config = {
  projects: [
    { ...shared, displayName: 'Unit', testMatch: ['<rootDir>/tests/Unit/**/*.test.ts'] },
    {
      ...shared,
      displayName: 'Integration',
      testMatch: ['<rootDir>/tests/Integration/**/*.test.ts'],
      setupFiles: ['<rootDir>/tests/Support/loadTestEnv.ts'],
    },
    {
      ...shared,
      displayName: 'Functional',
      testMatch: ['<rootDir>/tests/Functional/**/*.test.ts'],
      setupFiles: ['<rootDir>/tests/Support/loadTestEnv.ts'],
    },
  ],
};

export default config;
