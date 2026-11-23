import {describe, it} from "node:test";

export {expect} from "expect";
export {after as afterAll, afterEach, beforeEach, describe, it} from "node:test";
// The expectFailure option only counts errors from the test body, not from afterEach.
export const itFails = it.skip;
export const itConcurrent = it;

export function describeConcurrent(name: string, fn: () => void) {
    describe(name, {concurrency: true}, fn);
}

export function itConcurrentFails(name: string, fn: () => Promise<void>) {
    it(name, {expectFailure: true}, fn);
}
