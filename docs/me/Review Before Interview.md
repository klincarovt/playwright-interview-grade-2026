# Review before the interview

What to remember, the parts that were shaky, and what to read. Work top to bottom: 🔴 first.

## 🔴 Shaky: make sure you can explain these

### 1. The config loader (`src/config/environments.ts`)
Claude restructured it, so read it once yourself. Explanation: [Environment Config.txt](Environment%20Config.txt), [Framework Initiation §9–10](Framework%20Initiation.md).
- `.env` = **which** environment + secrets (never committed). `config/*.json` = URLs + paths (committed).
- Flow: dotenv → list `config/environments/*.json` → zod checks `ENV` (default `dev`) → read env file + routes → zod checks the shapes → export `env`, `routes`.
- dotenv never overwrites a variable that's already set → CI's `ENV` wins.
- Be able to say: *"Config is one JSON per environment, validated with zod at startup; a new environment is a new file."*

### 2. zod and `unknown`
- TS types are **erased at runtime** (like Java generics). `JSON.parse` / `response.json()` return `any` → nothing is checked.
- `unknown` = "check me before use". zod: **describe the shape → `.parse(data)` → typed data or an error with the exact field**.
- `z.object`, `z.string()`, `z.number()`, `z.url()`, `z.enum([...])`, `.default()`, `z.array(X)`, `z.record(key, value)` (= `Map`), `z.infer<typeof S>` (type from the schema).
- Rule: validate what you **receive** (responses, files, env vars). What you **send** (`User`) is a plain type checked by `tsc`.

### 3. Fixtures ([Fixtures.md](Fixtures.md))
- A fixture = setup → `await use(value)` (the test runs here) → teardown. Tests ask for it by name: `async ({ loginPage })`.
- **Test scope** (default) = fresh per test. **Worker scope** = once per parallel process, shared: only for things with **no test state** (the API context). A worker fixture can only use worker fixtures.
- `index.ts` = facade: `test = mergeTests(uiTest, apiTest)`, `apiTest` (no browser), `expect`. Tests never import from `@playwright/test`.
- The `user` fixture: create via API → `use` → delete, **even if the test failed**.

### 4. The API fixture ([API Layer.md](API%20Layer.md))
- `APIRequestContext` = a configured HTTP client (Java `HttpClient`), not a line that stays open. We create it (`request.newContext({ baseURL })`), so we `dispose()` it.
- Small-project alternative: the built-in `request` fixture (one `baseURL`, Playwright closes it).
- Client = how to call (no asserts) · fixture = builds it · test = calls + asserts.

### 5. `async` / `await` / `Promise`
- `async` methods return a `Promise` right away (= `CompletableFuture`). `await` = wait for it (= `join()`).
- Missing `await` = the test moves on before the click happened. Lint (`no-floating-promises`) catches it.
- `await` only works inside an `async` function.

## 🟡 Traps you hit (remember the symptom)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `page.goto: url: expected string, got undefined` / `First argument must be a URL string` | Route key typo or missing (`api.createAccount`, no `homePath`). `z.record` allows any key, so `tsc` doesn't catch it | Check the key name in `routes.json` (`…Path`) |
| URL loses `/api` | `baseURL` with a path + a path starting with `/` | `baseURL` = host only, paths carry `/api/...` |
| `strict mode violation: resolved to N elements` | `getByText('Cart')` matches **part** of text ("Add to cart") | `getByRole('link', { name })` + scope to a `root` |
| Locator finds things outside the header | Searched `page.` instead of the component's `root` | `this.root = page.getByRole('banner')`, then `this.root.getBy…` |
| `this.deleteAccount.click()` | Called `click()` on the **method**, not the locator | `this.deleteAccountNav.click()` |
| Circular project dependency | `setup` had `dependencies: ['setup']` | `dependencies` goes on the project that waits |
| Lint `no-unsafe-assignment` | Stored `any` from `JSON.parse` | `: unknown` or straight into `Schema.parse(...)` |
| Lint `no-empty-object-type` on `{}` | `{}` = "any non-null value" in TS | `Record<never, never>` |

## 🟢 One-liners to know (README → Interview lines has more)
- **Page object:** `readonly` locators + user-intent methods (`login()`), no assertions. Tests assert on its locators.
- **No BasePage:** a page *has* a `HeaderComponent` (composition). Inheritance only at the Rule of Three.
- **Locators:** `getByRole` → `getByLabel`/`getByText` → `getByTestId` (`data-qa`) → CSS. Never XPath.
- **Never hardcode:** paths from `routes`, URLs from `baseURL`, secrets from env, file paths from `paths.ts` (`path.join`).
- **The site returns HTTP 200 on errors** → assert `body.responseCode`, never `response.ok()`.
- **Auth:** a `setup` project logs in once → `storageState` → `chromium-user` starts logged in; `teardown` deletes the account. Roles are projects.
- **Every test is made to fail once.** A check you've never seen fail may check nothing.
- **CI runs `npm run check`** because Playwright never type-checks.

## 📖 What to read (official docs, in this order, ~1–1.5 h)
1. Fixtures: https://playwright.dev/docs/test-fixtures (test vs worker scope, overriding built-ins)
2. Authentication: https://playwright.dev/docs/auth (setup project, `storageState`, multiple roles)
3. Locators: https://playwright.dev/docs/locators (role, text, test id, filtering, strictness)
4. API testing: https://playwright.dev/docs/api-testing (`request.newContext`, `dispose`)
5. Projects + dependencies: https://playwright.dev/docs/test-projects
6. Best practices: https://playwright.dev/docs/best-practices
7. zod basics: https://zod.dev (objects, arrays, `parse`, `infer`)
8. TypeScript: `unknown` vs `any`, generics: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

## Questions to answer out loud (plan §20)
- What are fixtures, and why use them over hooks / a BasePage?
- Test vs worker scope? When is teardown needed?
- Where do assertions go, and why not in page objects or clients?
- How do you handle auth for many tests and several roles?
- How do you keep tests parallel-safe? (unique data, own accounts, cleanup)
- How do you structure API tests? (client, schema, positive + negative, assert the body)
- How do you manage environments and secrets?
- Which parts are overkill for this site, and why build them anyway?
