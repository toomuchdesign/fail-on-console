# Testing

`fail-on-console` supports Vitest, Jest and `node:test`. The cross-runner suite in `src/__tests__/` runs unchanged under all three, so every behavior it covers is checked in each runner the library supports.

## Terminology

- A _runner adapter_ is a per-runner module in `src/__runner-adapters__/` that maps the runner's test API to shared names.
- The _cross-runner suite_ is the tests in `src/__tests__/`. They run unchanged under every runner.

Test files import the library from `#fail-on-console`, which resolves to `src/` or `lib/` depending on the runner.

## Run the tests

| Script             | Runner      | Tests                                |
| ------------------ | ----------- | ------------------------------------ |
| `pnpm test:vitest` | Vitest      | `src/`, with v8 coverage             |
| `pnpm test:jest`   | Jest        | `src/`                               |
| `pnpm test:node`   | `node:test` | `lib/`, after running `pnpm build`   |
| `pnpm test`        | All three   | Runs the scripts above in that order |

`test:node` builds `lib/` first, so it never tests stale output. The `test:node:<project>` scripts run one project without the build.

## Runner adapters give every test file the same imports

No runner exposes globals. Each test file imports `describe`, `it`, the hooks and `expect` from `#runner-adapter` and the library from `#fail-on-console`:

```ts
import {describe, expect, it, itFails} from "#runner-adapter";
import {allowConsole} from "#fail-on-console";
```

The `imports` field in `package.json` maps both names per runner:

```jsonc
"imports": {
    "#runner-adapter": {
        "node-test": "./src/__runner-adapters__/node.ts",
        "jest": "./src/__runner-adapters__/jest.ts",
        "default": "./src/__runner-adapters__/vitest.ts"
    },
    "#fail-on-console": {
        "node-test": "./lib/index.js",
        "default": "./src/index.ts"
    }
}
```

Each runner selects its entry through its own config. Vitest uses `default`. Jest sets `testEnvironmentOptions.customExportConditions` to include `jest`. The `test:node:<project>` scripts pass `--conditions=node-test`. A test file never names a runner.

Every runner adapter in `src/__runner-adapters__/` exports the same names: `describe`, `it`, `beforeEach`, `afterEach`, `afterAll`, `expect`, `itFails`, `describeConcurrent`, `itConcurrent` and `itConcurrentFails`. The Vitest and Jest adapters re-export from `vitest` and `@jest/globals`. The Node adapter re-exports from `node:test` and takes `expect` from the standalone `expect` package.

`src/__fixtures__/setup.ts` calls `setupConsole` with the hooks from `#runner-adapter`, the same way a user of that runner would.

## How the runners differ

The runner adapters and the library close each gap in this table, so the cross-runner suite stays the same.

| Difference                         | Vitest                                                                  | Jest                                                              | `node:test`                                                                  | How the suite handles it                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Global test functions              | Only with `globals: true`                                               | Yes, unless `injectGlobals: false`                                | No                                                                           | Vitest leaves `globals` off and Jest sets `injectGlobals: false`, so a test that forgets an import fails in every runner.                    |
| `expect`                           | Built in                                                                | Built in                                                          | None, only `node:assert`                                                     | The Node adapter imports the `expect` package.                                                                                               |
| Marker for a test that must fail   | `it.fails`, counts `afterEach` errors                                   | `test.failing`, counts only errors from the test body             | `expectFailure` option, counts only errors from the test body                | `itFails` is `it.fails` under Vitest and `it.skip` elsewhere. Failure-path tests run only under Vitest, and the skipped count shows the gap. |
| `afterEach` hooks after one throws | Skipped                                                                 | Run                                                               | Skipped                                                                      | `setupConsole` restores every override before it reports, so a failing check can't leave `console` patched.                                  |
| TypeScript                         | Built in                                                                | `ts-jest`                                                         | Type stripping                                                               | Node tests the built `lib/` through `#fail-on-console`, because `src/` uses extensionless relative imports.                                  |
| Setup file                         | `setupFiles`                                                            | `setupFilesAfterEnv`                                              | `--import`. Hooks registered in the preloaded module apply to the test file. | Each runner loads `src/__fixtures__/setup.ts` its own way.                                                                                   |
| Concurrent tests                   | `describe.concurrent`. A test ending restores `console` for the others. | `it.concurrent`. Bodies run outside `beforeEach` and `afterEach`. | `concurrency` option. A test ending restores `console` for the others.       | The `concurrency` project expects a failure under every runner, through `describeConcurrent`, `itConcurrent` and `itConcurrentFails`.        |

`fail-on-console` fails a test from `afterEach`, after the test body returns. A marker that counts only body errors still reports these tests as failed, so Jest and `node:test` skip them instead.

Node parses the `.ts` test files as ES modules and warns that `package.json` has no `type` field. The `test:node:<project>` scripts silence that warning with `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON`, because adding `"type": "module"` would change how `lib/` is built and loaded.

## Five projects per runner

`setupConsole` can run once per module instance, and some suites need their own setup. Each runner splits the tests into the same five projects:

| Project       | Files                                                  | Setup                                                  |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `core`        | All of `src/__tests__/*.test.ts` except the four below | `src/__fixtures__/setup.ts`                            |
| `assert`      | `assert.test.ts`                                       | Calls `setupConsole` itself                            |
| `concurrency` | `concurrency.test.ts`                                  | Calls `setupConsole` itself, without stream monitoring |
| `formatting`  | `formatting.test.ts`                                   | Calls `setupConsole` itself                            |
| `validation`  | `validation.test.ts`                                   | None, it tests `setupConsole` errors                   |

Vitest and Jest declare the projects in their config files and select the `core` files with a glob. `node:test` has no exclude option, so `test:node:core` lists its files. To add a test file to `core`, also add it to `test:node:core`.

## Add a runner

1. Add a runner adapter at `src/__runner-adapters__/<runner>.ts` with the same exports as the others.
2. Add a `<runner>` condition to `#runner-adapter` and, if the runner can't load `src/`, to `#fail-on-console`.
3. Add the runner's config with the five projects and the setup file.
4. Add a `test:<runner>` script, and add it to `test`, `verify` and CI.
5. Add a column for the runner to the table in "How the runners differ".
