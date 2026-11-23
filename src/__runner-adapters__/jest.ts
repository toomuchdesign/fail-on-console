import {describe, it} from "@jest/globals";

export {afterAll, afterEach, beforeEach, describe, expect, it} from "@jest/globals";
// test.failing only counts errors from the test body, not from afterEach.
export const itFails = it.skip;
export const describeConcurrent = describe;
export const itConcurrent = it.concurrent;
export const itConcurrentFails = it.concurrent.failing;
