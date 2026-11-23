# Fixtures

## What a fixture is
Setup + teardown that a test asks for **by name**. Java: `@BeforeEach` + `@AfterEach` in one method, injected like Spring `@Autowired`.

```ts
something: async ({ page }, use) => {
  // setup: before the test
  await use(value);   // ← the test runs HERE and receives `value`
  // teardown: after the test, even if it failed
},
```

## Our files (`src/fixtures/`)

| File | What it does |
| --- | --- |
| `ui.fixtures.ts` | Overrides the built-in `context` → every page blocks ads. Adds `loginPage` (`new LoginPage(page)` once, tests never write `new`) |
| `index.ts` | **The facade / front door.** Tests import `test` + `expect` only from here. Today it re-exports (`export { test } from './ui.fixtures'`). From S5 it combines UI + API fixtures |
| (S5) `api.fixtures.ts` | API request context per service + clients |

**Rule:** tests never import from `@playwright/test` directly. That `test` has no `loginPage` and no ad blocking.

## Ad blocking
```ts
await context.route(AD_HOSTS, async (route) => { await route.abort(); });
```
- `context.route(pattern, handler)` intercepts every browser request matching the pattern.
- `abort()` = cancel (the request never reaches the network). `fulfill()` = fake response (mocking). `continue()` = let it through.
- `AD_HOSTS` is a regex: `/a|b/` = URL contains `a` or `b`.

## `mergeTests`
Combines several fixture sets into one `test`:
```ts
export const test = mergeTests(uiTest, apiTest);   // UI specs: pages + API clients (e.g. create a user via API, check it in the UI)
export const apiTest = ...;                        // API specs: API fixtures only → no browser starts
```
Java: like one test class getting beans from two `@Configuration` classes.

## Auth: setup project + saved session (S6)
```
setup project (once):       create account via API → write ACCOUNT_FILE → log in via UI → storageState → USER_STATE
chromium-user (per test):   starts from USER_STATE = already logged in, no login step
teardown project (once):    read ACCOUNT_FILE → delete the account
```
| Config | Meaning |
| --- | --- |
| `dependencies: ['setup']` | run `setup` first |
| `teardown: 'teardown'` (on setup) | run `teardown` after everything that depended on setup |
| `storageState: USER_STATE` | each test starts with these cookies |
| `testDir` / `testIgnore` | which folder a project runs: `tests/ui` = guest, `tests/user` = logged in |

**Roles are projects:** guest (`chromium`) and user (`chromium-user`). Login tests stay in the guest project, so no opt-out is needed. A new role (admin) = a new project + its own state file.

The account file is written **before** the login, so teardown can delete the account even if the login fails.

## Types: `base.extend<{ loginPage: LoginPage }>`
The `<…>` (generics, like Java) tells TypeScript which fixtures exist and their types, so `async ({ loginPage })` compiles.
