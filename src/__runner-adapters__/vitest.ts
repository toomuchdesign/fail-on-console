import {describe, it} from "vitest";

export {afterAll, afterEach, beforeEach, describe, expect, it} from "vitest";
// it.fails also counts errors from afterEach, where fail-on-console fails a test.
export const itFails = it.fails;
export const describeConcurrent = describe.concurrent;
export const itConcurrent = it;
export const itConcurrentFails = it.fails;
