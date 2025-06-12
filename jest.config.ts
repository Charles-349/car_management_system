import type {Config} from 'jest';

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage:true,
  coverageDirectory:"coverage",
coveragePathIgnorePatterns:[
  "/node_modules",
  "src/drizzle/schema.ts",
  "src/drizzle/db.ts"
]
};

export default config;