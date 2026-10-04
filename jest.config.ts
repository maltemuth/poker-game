import type { Config } from "jest";

const config: Config = {
  moduleNameMapper: {
    // sources import each other as .js (ESM style); Jest resolves the .ts file
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      { jsc: { parser: { syntax: "typescript" }, target: "es2022" } },
    ],
    // poker-hands is ESM only, and linked from ../poker-hands rather than
    // installed into node_modules, so its build is compiled like our sources
    "^.+\\.js$": [
      "@swc/jest",
      { jsc: { parser: { syntax: "ecmascript" }, target: "es2022" } },
    ],
  },
};

export default config;
