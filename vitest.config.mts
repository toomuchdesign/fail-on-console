import {defineConfig} from "vitest/config";

const baseConfig = {
    environment: "node"
};
const assertSuite = "./src/__tests__/assert.test.ts";
const concurrencySuite = "./src/__tests__/concurrency.test.ts";
const formattingSuite = "./src/__tests__/formatting.test.ts";
const validationSuite = "./src/__tests__/validation.test.ts";

export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["html", "json-summary", "json", "text"],
            reportOnFailure: true
        },
        projects: [
            {
                test: {
                    ...baseConfig,
                    include: ["./src/__tests__/*.test.ts"],
                    exclude: [assertSuite, concurrencySuite, formattingSuite, validationSuite],
                    setupFiles: ["./src/__fixtures__/setup.ts"],
                    name: "core"
                }
            },
            {
                test: {
                    ...baseConfig,
                    include: [assertSuite],
                    name: "assert"
                }
            },
            {
                test: {
                    ...baseConfig,
                    include: [concurrencySuite],
                    name: "concurrency"
                }
            },
            {
                test: {
                    ...baseConfig,
                    include: [formattingSuite],
                    name: "formatting"
                }
            },
            {
                test: {
                    ...baseConfig,
                    include: [validationSuite],
                    name: "validation"
                }
            }
        ],
        reporters: ["default", "github-actions"]
    }
});
