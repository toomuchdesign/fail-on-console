import {setupConsole} from "#fail-on-console";
import {afterEach, beforeEach, describeConcurrent, expect, itConcurrent, itConcurrentFails} from "#runner-adapter";

const originalWarn = console.warn;

// No stream monitoring: node:test reports results over stdout while concurrent tests run.
setupConsole({afterEach, beforeEach});

/**
 * Documents why concurrent tests aren't supported: the overrides live at
 * module scope, so a concurrent test can run while console isn't monitored.
 */
describeConcurrent("fail-on-console concurrent gap", function () {
    itConcurrentFails("should monitor console until a concurrent test ends", async function () {
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(console.warn).not.toBe(originalWarn);
    });

    itConcurrent("should end first", async function () {
        await new Promise((resolve) => setTimeout(resolve, 10));
    });
});
