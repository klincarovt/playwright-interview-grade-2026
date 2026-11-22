# Progress (for Claude)

JoJo's notes (commands, takeaways) live in `README.md` → "My notes". Deep dives live in `docs/me/`.

## Resume point
**S4 ✅ (2026-11-23).** `UserClient` (create/delete, `form`), `src/types/user.ts`, `buildUser({ ...overrides })`, `MessageResponseSchema` in `common.schema.ts` (renamed from ErrorResponse), `user` per-test fixture (create → guard 201 → use → delete). Hybrid happy path green (2 workers). Route-key typo trap hit twice (`api.createAccount`) → stricter routes schema = "what I'd add". Quick mode on (JoJo exhausted): full snippets, no curl. **S7 ✅ (2026-11-23):** CI = installer workflow + `npm run check` step + `install --with-deps chromium` (JoJo pasted the "→" text twice, fixed). CI already caught the `price: z.number()` push. **Next: README (S8). S6 cut.**

**▶ RESUME HERE (2026-11-22, JoJo on a break): S5 ✅ pushed (`8961bcd`). Next = `UserClient`, step 0: JoJo runs the 2 curl commands (createAccount POST with all form fields → expect 201; deleteAccount DELETE email+password → expect 200) and pastes the output. Then: routes (`createAccountPath`, `deleteAccountPath`, maybe `verifyLoginPath`) → `UserClient` → user builder (`crypto.randomUUID()`) → `userClient` fixture → S4 happy path (API creates user → UI login → `header.loggedInAs` contains name → delete via API). Then S6 → S7 → S8.**

**S5 core ✅ (2026-11-22, commit pending by JoJo).** API `baseURL` = host only, paths `/api/...` (fixed the `/api` loss). Verified with curl: HTTP 200 + body 405 / 400. `src/api/clients/ProductClient.ts` (`getProductsList`, `postProductsList`, `searchProduct(term?)` with `form`), `src/api/models/products.schema.ts` (Product, ProductsListResponse, ErrorResponse, `z.infer`), `src/fixtures/api.fixtures.ts` (`apiContext` via `request.newContext` + `dispose`, `productClient`, worker scope, `Record<never, never>`), `index.ts` = `mergeTests(uiTest, apiTest)` + `apiTest` + `expect`. `tests/api/products.spec.ts`: GET list (schema) + POST 405, both green, 2 workers, no browser. Failed on purpose: 400 vs 405 (wrong expectation). Schema-fail check done (price → number).
- **Next:** search product spec (positive + 400 negative) is optional; then the S4 happy path needs an account → `UserClient` (`createAccount` / `deleteAccount`, form fields, verify codes first) → hybrid test: API creates user → UI login → `header.loggedInAs`. Then S6/S7/S8 as time allows.
- JoJo questioned: "do we need a model" (yes: lint blocks `any` + contract check), "models obsolete unless we send data" (no: validate what we receive), built-in `request` vs own context (noted in API Layer.md), worker scope, "is it an active connection".
- Claude overwrote JoJo's unsaved `productClient` when rewriting the file to add comments → rule: for comment requests, insert lines, don't rewrite the file.

**S4 part 1 ✅ (2026-11-22):** `loginPage` fixture, `src/fixtures/index.ts` (facade, re-exports; S5 `mergeTests` lines commented), `tests/example.spec.ts` deleted, `tests/ui/login.spec.ts` negative login green, made to fail (JoJo broke the locator text). Commit pending. **Next: S5 (API) first, then S4 happy path = create the account via API → log in via UI → `header.loggedInAs` (hybrid, also proves the logged-in locators).** Notes doc: `docs/me/Fixtures.md`.

**S3 ✅ (2026-11-22). Ad-blocking fixture in `src/fixtures/ui.fixtures.ts` (overrides `context`, `AD_HOSTS` regex, `async (route) => { await route.abort(); }`; comments added by Claude on request). Commit "Add ad-blocking UI fixture" pending (JoJo). Next: S4 = `loginPage` fixture (`base.extend<{ loginPage: LoginPage }>`, teach generics) + `src/fixtures/index.ts` + first spec `tests/ui/login.spec.ts`: negative login first (no account needed), then happy path (needs an account: UI signup or wait for S5 API).**

**S3 in progress (2026-11-22). Done: `src/ui/pages/LoginPage.ts` + `src/ui/components/HeaderComponent.ts` (ESLint MCP clean; JoJo to run `npm run check` + commit "Add LoginPage and HeaderComponent"). Next: ad-blocking fixture (first fixture: teach `test.extend`, `context.route`, `route.abort()`, `use()`), then S4.**
- LoginPage: `data-qa` inputs (two "Email Address" fields → testid), `loginErrorText` via `getByText`, `goto()` from `routes`, `login()`, `signUp()`, `header: HeaderComponent` (composition). Locators public `readonly` (tests assert on them).
- HeaderComponent: `root = page.getByRole('banner')`, all links `this.root.getByRole('link', …)`, `loggedInAs = root.getByText('Logged in as')`, methods `toHome/toProducts/toCart/toSignUpOrLogin/logout/deleteAccount`. JoJo kept extra unused navs (Test Cases, API Testing, Contact us), no methods for them.
- Mistakes caught: signup clicked `loginButton`; hardcoded `'/page'` path in a field; `getByText('Cart')` (matches "Add to cart"); unscoped header locators; `this.deleteAccount.click()` (method instead of locator); `LoginPage.logout()` forwarding to header (deleted). Folder `src/pages` → `src/ui/pages` (JoJo asked; kept per plan).
- Verified via Playwright MCP: header = `banner`, link names have an icon glyph prefix. JoJo made a manual throwaway account (codegen) and confirmed Logout / Delete Account / "Logged in as". Password not stored anywhere (rule: secrets only in env).
- Decisions: no BasePage (Rule of Three), add locators only when a test uses them, `goto()` naming, page objects created by fixtures not `new` in tests (S4).

**S2 ✅ (2026-11-22), pushed.**
JoJo is short on time: keep replies tiny, give near-complete snippets, skip non-⭐ items.
- S2 leftovers: `screenshot: 'only-on-failure'` not added; `.env.example` still shows modified (Claude can't read it, ask JoJo); dotenv comment block kept in `playwright.config.ts` by JoJo's choice (typo "antother"); `npm run test:api` → "No tests found" (expected). Pushed "by mistake" → fine, private repo, solo on main.
- API baseURL `/api` vs leading-slash paths → fix in S5 (see below).

**Older (S2 history):**
**S2 in progress (2026-11-22). Step 5 written (`environments.ts` complete: dotenv → names → zod ENV → read env + routes → zod shapes → export `ENV`, `env`, `routes`). ✅ Failure proved (`"login"` → ZodError with path `automationexercise.web.loginPath`). ✅ `npm run check` green (after `: unknown` on the `JSON.parse` lines, lint `no-unsafe-assignment`). Pending: JoJo restores `"/login"`, commits when ready (said "wait") → step 6 `playwright.config.ts`.**
- 🔁 **Open review (JoJo, 2026-11-22: "I will need to review this later"):** Claude rewrote `environments.ts` on request ("make it prettier, better explained"): 3 parts (schemas → which ENV → load+check+export), `readJson()` helper returning `unknown`, `export const { ENV } = …` (destructuring, new). JoJo pushed back hard on complexity ("50 lines for one command", "do people use this?", zod unclear) → explained zod basics + why JS objects aren't enough (types erased at runtime). Check question open: `UserSchema.parse({ name: 'Jo', age: '30' })`. **JoJo will review it and explain it back to themself, later, on their own time (2026-11-22). Don't ask for it; answer questions if they come up.** Not yet confirmed: `npm run check` + `tsx` after the rewrite. Not committed.
- ⚠️ **For S5 (found by Claude, not yet told to JoJo):** `api.baseURL` = `https://automationexercise.com/api` + paths starting with `/` → Playwright resolves with `new URL()`, so `/productsList` drops `/api` → hits `https://automationexercise.com/productsList`. Fix in S5: api `baseURL` = origin only + paths `/api/productsList`, OR baseURL with trailing `/` + paths without leading `/` (breaks `startsWith('/')`). Recommend the first. Teach it as "verify before you trust" when the first API call is made.
- Step 5 notes: JoJo found it "too complicated" several times → got the step-6 schemas as a full snippet, asked Claude to fix comments + finish. `ENV=pre` with empty `pre.json` tested (found, no code change), then `pre.json` deleted by Claude. Known gap: `{}` passes `z.record` (zero apps). Explanation file: `docs/me/Environment Config.txt`. zod 🟡: used, not yet explained back by JoJo → ask JoJo to explain the loader top to bottom after the commit.
- ✅ Step 4 (session 2): `src/config/paths.ts` = `ROOT_DIR` (2× `'..'`), `ENVIRONMENTS_DIR`, `envFile(name)`, `ROUTES_FILE`, `AUTH_DIR`; verified with `npx tsx -e` + `{ ...paths }`. On the way: moved the WHOLE `config/` into `src/` (two folders named `config` confused it → moved back), 3× `'..'`, leftover `console.log`. Q8 ⚠️ ("we use methods because we can"; called `path.join` a "TypeScript method" → Node function; answer = OS separators, slash/`..` normalising). `"routes.json"` double quotes may still be there. `npm run check` (JoJo added `check` script) **not run yet** → ask before commit.
- Design answers: keep two `config` folders (data vs loader), `paths.ts` not in `utils/`, `envFile` takes the name as a parameter (loader validates `ENV`, not paths.ts). JoJo: "act as a senior" → one decision + reason.
- ✅ Step 1: `.env*` + `!.env.example`, `.env.example` = `ENV=` (first try was `*.env*`).
- ✅ Step 2: zod ^4.6.7, dotenv ^18.0.10.
- ✅ Step 3 (kept, JoJo said yes): `config/environments/dev.json` (`{ automationexercise: { web: { baseURL }, api: { baseURL } } }`) + `config/routes.json` (`{ automationexercise: { web: { loginPath, productsPath }, api: { productsListPath, searchProductPath } } }`). History: JoJo made `prod.json` nested by site with an empty `otherWebsite` → renamed to `dev.json`, wanted multiple apps + paths in config + naming (`…URL` / `…Path`). **Claude overstepped**: asked only to fix naming, but also split paths into `routes.json` and moved the file into `environments/` (so `routes.json` isn't discovered as an env). JoJo kept it. → JoJo must read both files and be able to explain them.
- ✅ Q7: "default dev so we don't impact production data; prod only in certain windows, if at all". Notes: prod runs are usually read-only smoke.
- ⏳ **Step 4 (JoJo writing it):** first attempt was `config/paths.ts` (wrong folder: not in tsconfig `include`, and ESLint `files: ['**/*.ts']` + `projectService` will fail on it), `ROOT_DIR` = `'../../cofig/'` (typo, and the root isn't inside `config`), `'..'` inside `path.join` after `'config'` (undoes it). Explained: `'..'` per argument = one step up, names = steps down, climb once to `ROOT_DIR`. Target: `ROOT_DIR` (`__dirname, '..', '..'`), `ENVIRONMENTS_DIR`, `ROUTES_FILE`, `envFile(name)` helper, `AUTH_DIR`. Open: **Q8** (why `path.join` over a template string).
- **Before step 5, teach:** dotenv, zod basics, `fs.readdirSync` / `readFileSync` / `JSON.parse` (all ⬜ in the concept tracker).
- **Then:** 5 `src/config/environments.ts` (dotenv → list `config/environments/*.json` → zod `process.env` with `z.enum(names)` default `dev` → read env file + routes → zod (`z.record` of apps) → `export env, routes`) → 6 `playwright.config.ts` (`api` + `chromium` projects with `baseURL` from `env`, `testIdAttribute: 'data-qa'`, `workers: 2` CI, reporters, `metadata`). Then commit.
- Re-ask Q3, Q4, Q5 after S2.
- **New rule (JoJo):** Claude doesn't edit project files unless asked; keeps its own docs. Never touches permissions. JoJo asked what Claude can access outside the sandbox → explained (reads most files except `.ssh`, `.aws`, `.env*`; writes only the project + temp).

**Design decisions this session (all in plan + CLAUDE.md):**
- **Senior grade, built for a large system, whole project** (JoJo). Overkill accepted; each extra pattern gets a README/ADR line. 🏢 Scale tier added to the plan (health check, `toMatchSchema`, cleanup registry, GitHub Environments, CODEOWNERS).
- Config = JSON per environment + zod (JoJo rejected the typed `.ts` map as "not senior"; compared with Java `ConfigReader`/properties).
- **One environment only** (JoJo: "only duplication"): `config/environments/dev.json`. Valid `ENV` = files in `config/environments/` → new env = new file, zero code change.
- **Multiple apps per env file** (JoJo: "we will have other apps later"): top-level keys = apps, services `web` / `api` inside. No placeholders (schema `z.record` already allows any number).
- **Paths are data too** (JoJo), but in ONE `config/routes.json` (same for every env) → replaces the planned `routes.ts` + `endpoints.ts`. Naming: `…URL` for full URLs, `…Path` for paths, no app prefixes (JoJo asked about `atmWEB`-style → no, the app key is the namespace).
- One Playwright project per service: `api` + `chromium` (prefix with the app name once there's a second app; CLI supports `--project='*-api'`). npm scripts unchanged. `testIdAttribute` in `playwright.config.ts`.
- Plan fully rewritten for scale (design-goal section, two tag axes, one context per service, new interview questions, ADR list 0001–0007).

**Time left: 1 day, maybe 2.** Cut order if short: S6 → S7 → S8. Never cut S5. Mock task only if day 2 happens.

`npm run test:api` currently fails with "Project(s) "api" not found" → expected until the `api` project exists.

Repo is **private** (JoJo, 2026-11-22) → `docs/ai/progress.md` can stay tracked. **If it's ever made public** (to show an interviewer): decide first whether `docs/ai/` and `docs/me/` stay in. `.mcp.json`/`.claude/` in Claude's `git status` were sandbox phantoms; `.playwright-mcp/` is real → gitignore.

## State
- Node v26.13.1, npm 11.20.0. Deps: @playwright/test ^1.65.1, typescript ^6.0.3, eslint ^10.15, typescript-eslint ^8.73, eslint-plugin-playwright ^2.12.
- tsconfig: `include` = `src`, `tests`, `playwright.config.ts` (no `src/` yet, fine).
- ESLint: `defineConfig` + `recommendedTypeChecked` on `**/*.ts` + `no-floating-promises` + playwright `flat/recommended` on `tests/**`.
- typecheck ✅ lint ✅ example tests 6/6 ✅.
- Installer's `.github/workflows/playwright.yml`: keep, replace in S7. Delete `tests/example.spec.ts` before S4.
- MCP servers (all **local scope**, in `~/.claude.json`, not in the repo): playwright (`--browser chromium`), eslint, context7. TS: `typescript-lsp` plugin installed + verified (typescript-language-server 6.1.0, global via nvm). All MCP/LSP setup done.

## Site findings (via Playwright MCP, 2026-11-22)
- `/products` makes **no `/api/*` calls**: server-rendered → nothing to mock on that page (§14 step 0). Check add-to-cart XHR later.
- Ad/consent domains to block in the S3 fixture: `pagead2.googlesyndication.com`, `fundingchoicesmessages.google.com` (consent), `ep1.adtrafficquality.google`. Also `automationexercise.com/cdn-cgi/rum` (Cloudflare analytics, harmless).
- 3 console errors: Google Fonts loaded over `http://` → mixed-content blocked. For README "Issues found".

## Issues faced
| Issue | Fix |
| --- | --- |
| `.gitignore` `Claude.local.md` wrong case, hidden by `core.ignorecase=true` on /mnt | Exact case |
| `git pull`: dead VS Code askpass socket + "Repository not found" | New terminal / `gh auth login` + `gh auth setup-git` |
| tsconfig `include` copied from old project layout | `src`, `tests`, config |
| ESLint config empty (0 bytes) → lint "passed" with no rules | Write + save the config |
| ESLint config `base` only, no Playwright plugin | `recommendedTypeChecked` + playwright `flat/recommended` |
| MCP not visible after `claude mcp add` | Restart Claude Code |
| Playwright MCP: `chrome` not found (defaults to Google Chrome); installing Chromium didn't help | Re-add with `--browser chromium` |
| `/mnt` edits report ENOENT but apply | Verify, don't retry |
| S2: `.gitignore` `*.env*` (too broad) | `.env*` |
| S2: `.ts` files in `config/` (twice) | Code in `src/`; `config/` JSON only |
| S2: `'..'` inside `path.join` after a folder | Climb once to `ROOT_DIR`, then only go down |
| S2: Claude edited `config/` beyond "fix the naming" | Rule: don't edit project files unless asked; "fix X" = only X |

## Step log
| Step | Date | Notes |
| --- | --- | --- |
| Setup | 2026-11-22 | Ways of working: `CLAUDE.md`, `CLAUDE.local.md`, README "My notes" |
| S1 Part 1 | 2026-11-22 | git init + Playwright init + first push (`Init`). Case mismatch in `.gitignore` |
| S1 Part 2 | 2026-11-22 | tsconfig + ESLint working. MCP: playwright, eslint, context7 |
| S1 Commit | 2026-11-22 | `ef76397` pushed: tsconfig + ESLint + MCP + docs. Lint proven to fail. Git login via `gh` |
| **S1 ✅** | 2026-11-22 | `5327984` "Add npm scripts and reorganise notes". Description fixed, Q6 ⚠️. No more commit prefixes (JoJo's preference) |
| S2 part 1 | 2026-11-22 | `.env` rules + `.env.example`, zod + dotenv, config design (env files + routes, multiple apps, naming), plan rewritten for a large system, learning-first rule, `docs/me/TypeScript Basics.md` |
| S2 commit 1 | 2026-11-22 | `9d71e8d` "Add environment config, routes and paths module" (+ body). `.env.example` change made after staging was left out → next commit. Taught `-m` body, add → status → commit |
| S2 commit 2 | 2026-11-22 | `da14e1d` "Add config loader with zod validation" (Claude rewrote `environments.ts` into 3 parts on request; JoJo to review later) |
| **S2 ✅** | 2026-11-22 | `cbf19e3` "Wire config into Playwright projects": `api` + `chromium` with `baseURL` from `env`, `testDir`/`testIgnore`, `data-qa`, CI reporters, `metadata: { env: ENV }`. Pushed |
| S3 part 1 | 2026-11-22 | `LoginPage` + `HeaderComponent` written by JoJo (commit pending, JoJo runs it) |
| S3 ✅ | 2026-11-22 | Ad-blocking fixture (`context` override). Committed with S4 part 1 |
| S4 part 1 | 2026-11-22 | `loginPage` fixture, `index.ts`, first spec (negative login) green + failed on purpose. JoJo commits "Add page fixtures and first login test" |
| S5 core | 2026-11-22 | API client + schema + fixture + 2 API specs green. JoJo commits "Add products API client, schema and tests" |
| S1 Tooling | 2026-11-22 | All MCP servers connected + `typescript-lsp` plugin verified. Site check via MCP: `/products` server-rendered, ad domains noted. Deep dives reorganised into 3 files: `Framework Initiation.md` (project), `Tooling.md` (machine), `Site Notes.md` (site) |

## Concept tracker
JoJo is learning (Java background). Teach ⬜ before the step that needs it; re-check 🟡 later.

| Concept | Status | Notes |
| --- | --- | --- |
| git basics (init, add, commit, push, remote) | ✅ | |
| `.gitignore` rules (`!` order, `/` root, case) | ✅ | |
| Config vs secrets vs `ENV` selector | ✅ | JoJo drove the JSON-per-env design |
| Code vs data folders (`src/` vs `config/`) | 🟡 | Put `.ts` files in `config/` twice |
| JSON format | ✅ | Wrote valid JSON |
| npm scripts, `npm run x -- --flag` | ✅ | |
| MCP vs plugin | ✅ | |
| tsconfig options | 🟡 | Copy-paste knowledge; explained in Framework Initiation §6 |
| ESLint type-aware rules, tsconfig `include` (Q4/Q5) | 🟡 | Re-ask after S2 |
| `path.resolve` / `path.join`, `__dirname`, `'..'` as steps | 🟡 | Got it working after 3× `'..'`; Q8 partial (why `join`) |
| `import * as x`, `import { x }`, spread `{ ...obj }`, getters | 🟡 | Taught via the `tsx` check |
| `import`, `export const`, arrow functions, template literals | 🟡 | Explained for `paths.ts` |
| `process.env`, `!!`, ternary | 🟡 | In TypeScript Basics, used in `playwright.config.ts` |
| `await` / Promises | 🟡 | Weak spot; lint catches it |
| dotenv (what it does, why one place) | ✅ | Wrote `dotenv.config({ path: DOTENV_FILE, quiet: true })`; "dev wins" (no why given). Knows `.env` = selector + secrets |
| zod (schema, `z.object`, `z.record`, `z.enum`, `.default`, `.parse`, `z.infer`) | ⬜ | **Before step 5** |
| Node file reading (`fs.readdirSync`, `fs.readFileSync`, `JSON.parse`) | ⬜ | Before step 5 |
| Playwright config (`projects`, `use`, `baseURL`, `testIdAttribute`) | ⬜ | Before step 6 |
| POM, components, composition, `root` scoping | 🟡 | Built both in S3; needed several review rounds (scoping, hardcoding) |
| Classes in TS (`readonly`, constructor, `this`), `async`/`Promise<void>` | 🟡 | Asked "why are we promising" → explained as `CompletableFuture` |
| Locator order + `getByText` partial match / strict mode | 🟡 | `getByText('Cart')` mistake |
| Fixtures (`test.extend`, `use()`, override `context`, generics, `index.ts` facade) | 🟡 | Built ad blocking + `loginPage`; pasted the S5 `mergeTests` preview into `index.ts` by mistake (Claude's preview was unclear) |
| API client / fixture / worker scope / `mergeTests` | 🟡 | Built it; found the fixture confusing → explained with UI comparison table |
| zod response schemas, `z.array`, `z.infer`, `Record<never, never>` | 🟡 | Questioned the need, accepted after reasons |
| Web-first assertions, make-it-fail | ✅ | `toBeVisible()`; broke the locator text to prove the fail |

## Weak spots
- `await` on own async methods (missed 4× in prep repo) → ESLint `no-floating-promises` catches it
- Exact names matter (`BASEURL` vs `BASE_URL`, `Claude.local.md` vs `CLAUDE.local.md`)
- **Copied, not adapted**: tsconfig `include` from the old project. Check every copied path against this repo
- tsconfig/ESLint options were copy-paste knowledge only. Explained in Framework Initiation §6. Ask "why is X in your tsconfig?" later
- Q3: put URLs in `.env` at first → resolved in S2 (designed the config / secrets / `ENV` split)
- **Wrong folder** (S2, twice): `config/environments.ts`, `config/paths.ts`. `config/` = JSON only, code in `src/`
- **Path building** (S2): `'..'` placed after a folder name undoes it; didn't know `path.resolve` takes many arguments
- Q4 + Q5: couldn't answer, answers given (Framework Initiation §6). **Re-ask after S2**
- Q6: answered "general naming convention, we can do ui" → JoJo pushed back correctly: a script name and a CLI flag are different mechanisms, nothing breaks. The point is only the **convention** (`test:ui` usually = `playwright test --ui`). Graded ⚠️ partial, not ❌. Knows `npm run x -- --flag` now
- Isolation: a context is per **test**, not per spec file
- Retries flag flakiness, they don't fix it. Web-first assertions replace sleeps
- Failure triage: test / app / environment
- Check questions get skipped → ask them anyway
- Gets overwhelmed by long multi-part replies (reacted "?????"): keep each reply to one task
