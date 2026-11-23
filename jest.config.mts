import {defineConfig} from "jest";
import {createDefaultPreset} from "ts-jest";

const assertSuite = "<rootDir>/src/__tests__/assert.test.ts";
const concurrencySuite = "<rootDir>/src/__tests__/concurrency.test.ts";
const formattingSuite = "<rootDir>/src/__tests__/formatting.test.ts";
const validationSuite = "<rootDir>/src/__tests__/validation.test.ts";

const project = {
    injectGlobals: false,
    testEnvironment: "node",
    testEnvironmentOptions: {
        customExportConditions: ["jest", "node", "node-addons"]
    },
    ...createDefaultPreset({
        diagnostics: false,
        tsconfig: {
            isolatedModules: true
        }
    })
};

export default defineConfig({
    projects: [
        {
            displayName: "core",
            setupFilesAfterEnv: ["<rootDir>/src/__fixtures__/setup.ts"],
            testMatch: ["<rootDir>/src/__tests__/*.test.ts"],
            testPathIgnorePatterns: [assertSuite, concurrencySuite, formattingSuite, validationSuite],
            ...project
        },
        {
            displayName: "assert",
            testMatch: [assertSuite],
            ...project
        },
        {
            displayName: "concurrency",
            testMatch: [concurrencySuite],
            ...project
        },
        {
            displayName: "formatting",
            testMatch: [formattingSuite],
            ...project
        },
        {
            displayName: "validation",
            testMatch: [validationSuite],
            ...project
        }
    ]
});
