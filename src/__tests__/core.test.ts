import {setupConsole} from "#fail-on-console";
import {afterEach, beforeEach, describe, expect, it} from "#runner-adapter";

describe("fail-on-console", function () {
    it("should disallow calling setup twice", function () {
        expect(() => setupConsole({afterEach, beforeEach})).toThrow(/Call setupConsole\(\) only once./);
    });
});
