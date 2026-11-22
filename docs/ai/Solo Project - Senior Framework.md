# Solo Project - Senior Framework (interview-first, built to scale)

**Context:** interview soon: **1 day of prep, maybe 2** (said 2026-11-22). Expect a **Playwright test task** (take-home or live, not confirmed), then more interviews. So the order is:

1. **Starter kit** (S1–S8): a clean skeleton I know by heart, so the test task never starts from zero.
2. **Mock test task** (if day 2 happens): time-boxed, then a reviewer-style review.
3. **Interview prep** (15 min daily): the questions in section 20.
4. **Full framework** (after the task): Tier 1 → Tier 2 → Scale tier, built from memory with this file as the checklist.

**Deeper dive:** `Solo Project - Deep Dive.md` (not in this repo) builds on this file with the same section numbers.

**Site:** [automationexercise.com](https://automationexercise.com). It has a UI **and** a documented public API ([API list](https://automationexercise.com/api_list)), so there's a real API layer. Mock task: [saucedemo.com](https://www.saucedemo.com) (UI only), in **its own repo** copied from the starter kit: **one repo targets one site**.

**My angle:** 2 years of API testing → make the **API layer** the strongest part. It's what most UI-focused candidates do weakly.

---

## The design goal: senior grade, built for a large system

Every layer is designed **as if many teams, services and environments depended on it**, while still running on one small public site. Some of it is more than automationexercise needs. That's deliberate: to learn the patterns and **show them in an interview**.

| Principle | What it means here |
| --- | --- |
| **Config per environment** | `config/environments/<env>.json` with the **base URL of every app and service** in that environment. Only **`dev.json`** exists (one real environment; more files would be duplication). `ENV` picks the file (default `dev`, never `prod`). Valid names = the files in `config/environments/`, so adding `pre.json` adds an environment with **no code change** |
| **Split config by what changes** | URLs change per environment → `environments/<env>.json`. Paths don't → **one** `config/routes.json` for all environments. zod validates both at startup |
| **Many apps, one shape** | Top-level keys are **apps** (`automationexercise`, later `admin`…), each with the services `web` + `api`. Adding an app or a page is a data change |
| **Validate at the boundary** | Everything from outside is untrusted: env vars, config files, API responses → zod schemas. Static code is checked by `tsc` |
| **One service = one client** | Each backend service gets its own client with its own `baseURL` from config, so a second API host needs no rewrite |
| **Fail fast, triage fast** | Bad config, a missing secret or a down environment stops the run **before** tests start, with a message that says which one |
| **Parallel by default** | No shared mutable state: per-worker accounts, unique data, cleanup of everything a test creates |
| **Explicit ownership** | Tags for suite (`@smoke`/`@regression`) **and** area (`@auth`, `@cart`, `@api`), so teams can run "their" tests |
| **Scalable, not fake** | Never invent behaviour the site doesn't have, and don't duplicate to look big: one real environment = one config file. The README says how to add more |
| **Every extra pattern is explained** | One README/ADR line each: what it buys at scale, what a small project could skip |

**Interview line:** *"I built it the way I'd build it for a large system: one config file per environment with every service URL, validated with zod at startup, one client per service, per-worker data. The site has one environment, so there's one file; adding pre or prod is adding a JSON file, no code change."*

---

## 0. Test-task playbook (read before the real task)

### Before writing code (first 15 min)
- Read the task twice. List the scenarios and **ask questions** if anything is unclear (asking is a senior signal).
- Write down your **assumptions** for the README straight away.
- Ask or check: **are AI tools allowed?** If yes, say in the README how you used them.

### While building
- Build only the ⭐ items. In a take-home, **small, clean, well-explained beats big**. The large-system patterns live in the starter kit you copy, not in extra scope.
- Order: one test working end to end → refactor into page object + fixture → add the next scenarios → negative cases.
- Commit in small steps with clear messages (reviewers read the history).

### Time split for a 3–4 hour take-home
| Share | What |
| --- | --- |
| 10% | Read, ask questions, list assumptions |
| 60% | Tests + page objects + fixtures |
| 15% | Negative cases, config, lint, a basic CI file if time allows |
| 15% | **README** (decisions, trade-offs, "what I'd add with more time") |

### Live-coding variant
- Think aloud: say the principle while you do it ("I'm not asserting in the page object because…").
- Start with one working test, then refactor. A working simple test beats an unfinished framework.
- If stuck, say what you'd check (trace, locator in the inspector) instead of going silent.

### Final checks (last 15 min)
- [ ] `npm run lint` and `npm run typecheck` are clean
- [ ] Every test passes 3× in a row (`--repeat-each=3`) and each one has been made to fail once on purpose
- [ ] No `test.only`, no `waitForTimeout`, no secrets, no hardcoded local paths
- [ ] README: how to run, structure, decisions + trade-offs, assumptions, site quirks found, what I'd add with more time, AI usage

### README template
```
# <Project name>
## What it covers         (scenarios, UI / API)
## How to run             (install, env vars, npm scripts)
## Structure              (folders + the layer rule)
## Design decisions       (each with its trade-off)
## Assumptions
## Issues found           (bugs / quirks on the site, e.g. API returns 200 on errors)
## What I'd add with more time
## AI usage               (if allowed: what I generated, what I had to fix)
```

---

## ✅ Framework checklist

⭐ = starter kit and test task (what a reviewer checks first). 🏢 = **Scale tier**: the large-system showcase, built after Tier 1/2.

### Architecture
- [ ] ⭐ **POM**: one class per page, locators as `readonly` fields, methods = user intents
- [ ] ⭐ **Components**: shared parts (header, product card, cart modal) as their own classes; pages *have* them (composition)
- [ ] **BasePage only if needed**: start without one. Add one only when ≥3 pages share real behaviour (Rule of Three). Decision written in the README either way
- [ ] ⭐ **API clients**, one per resource (`ProductsClient`, `UserClient`), grouped **per service** (`src/api/<service>/`): no assertions, return responses
- [ ] ⭐ **Fixtures** inject pages + clients; `mergeTests` combines UI + API fixtures
- [ ] ⭐ **Routes as data**: `config/routes.json` holds every UI and API path per app (`routes.automationexercise.web.loginPath`). No full URL outside `config/environments/`
- [ ] Layer rule: tests → fixtures → pages/components/clients/builders → config (never upwards)

### Config & environments
- [ ] ⭐ **Config per environment**: `config/environments/<env>.json` = `{ "<app>": { "web": { "baseURL" }, "api": { "baseURL" } } }`. Committed, no secrets. **Only `config/environments/dev.json`** for now: one real environment, no duplicates
- [ ] ⭐ **Routes**: `config/routes.json` = `{ "<app>": { "web": { "loginPath": "/login" }, "api": { "productsListPath": "/productsList" } } }`. One file for all environments
- [ ] ⭐ **Naming**: full URL keys end in `URL`, path keys end in `Path` (values start with `/`); services are always `web` / `api`; no app prefixes on keys; no placeholder entries
- [ ] ⭐ **`ENV` selector**, default `dev`, never `prod`. **Valid names = the JSON files in `config/environments/`** (read from the folder, then `z.enum(names)`), so a new environment is a new file, no code change. Unknown `ENV` → error listing the files found
- [ ] ⭐ **Loader** `src/config/environments.ts`: dotenv → validate `process.env` → read `config/environments/<ENV>.json` + `config/routes.json` (paths from `paths.ts`) → validate each with a zod schema (`z.record` of apps) → `export const env, routes`. The **only** place dotenv is loaded
- [ ] ⭐ **App-wide settings in `playwright.config.ts`**, not per environment (e.g. `testIdAttribute: 'data-qa'`, the same in every env)
- [ ] ⭐ **Projects = one per service**: `api` (no browser, `baseURL: env.automationexercise.api.baseURL`) + `chromium` (web, `baseURL: env.automationexercise.web.baseURL`). With a second app, prefix the names (`admin-api`) and select with wildcards (`--project='*-api'`, supported by the CLI). Until then the npm scripts stay `--project=api` / `--project=chromium`
- [ ] ⭐ **Code vs data**: `config/` holds JSON only; all TypeScript lives in `src/` (tsconfig `include` doesn't cover `config/`, so code there is never type-checked and ESLint fails on it)
- [ ] ⭐ **Secrets** only from env vars (`.env` locally, GitHub Environment secrets in CI), validated by the same zod schema (required only where used)
- [ ] ⭐ **`.env.example`** listing every variable (`ENV=`), no values
- [ ] ⭐ **`.gitignore`**: `.env*` + `!.env.example`, `playwright/.auth/`
- [ ] ⭐ **`tsconfig.json`**: `strict`, `resolveJsonModule`, `esModuleInterop`, `include: ["src", "tests", "playwright.config.ts"]`
- [ ] ⭐ **Write state, not config**: config files are read-only at runtime. Generated state goes under **one `AUTH_DIR`** (`src/config/paths.ts`): `playwright/.auth/user.json`, `account.json`, later `worker-<n>.json`
- [ ] ⭐ **Run metadata**: `ENV` + URLs in the config's `metadata` and the report title, so every report says where it ran
- [ ] Explicit timeouts: `actionTimeout`, `navigationTimeout`, `expect.timeout` (can differ per env: slower `pre`)
- [ ] `.nvmrc` (or `engines` in package.json) to pin the Node version
- [ ] 🏢 **Environment health check** in `globalSetup`: ping every app's `web.baseURL` + `api.baseURL` before any test. Down → stop with "environment dev: automationexercise api is down", not 200 red tests (failure triage: env vs app vs test)

### Test data
- [ ] **Data providers**: JSON in `src/data/json/` + `for...of` → one named test per row
- [ ] **Builders**: `buildUser({ ...overrides })` with unique defaults (`crypto.randomUUID()`) → parallel-safe
- [ ] Data created via API in setup, deleted in teardown (fixture code after `use()`, or a teardown project)
- [ ] 🏢 **Cleanup registry**: a fixture that records every entity a test creates and deletes them all after `use()`, even when the test fails. Scales to many entity types without per-test cleanup code

### Tests
- [ ] ⭐ UI specs, API specs (positive + negative), schema checks, 1 hybrid e2e (API setup → UI verify)
- [ ] ⭐ Auth (starter kit): setup project **creates its own account via API**, logs in, saves `storageState`; a teardown project deletes the account; login tests opt out. Shared account only while logged-in tests don't change server state → then per-worker auth (§7, §15)
- [ ] `test.describe` + hooks, `test.step` in long flows
- [ ] ⭐ **Two tag axes**: suite (`@smoke`, `@regression`) + area (`@auth`, `@cart`, `@products`, `@api`) → `--grep "@smoke.*@cart"` runs one team's smoke set
- [ ] ⭐ Web-first assertions only, no `waitForTimeout`; `waitForResponse` only when there's no visible signal (§9)
- [ ] Typed API responses + **zod** schema validation (type derived from the schema)
- [ ] 🏢 **Custom matcher** `expect(response).toMatchSchema(schema)` via `expect.extend`: one line per contract check, clear diff on failure
- [ ] Contact Us form: file upload (`setInputFiles`) + confirm dialog (`page.on('dialog')`)

### Reporting
- [ ] ⭐ `list` + `html` (on CI: `open: 'never'`), JUnit XML on CI, screenshot on failure, trace on first retry; sharded runs add `--reporter=blob`
- [ ] ⭐ `ENV` and URLs in report metadata (see Config)
- [ ] Optional: Allure or a custom reporter for trend history across runs

### CI (GitHub Actions)
- [ ] ⭐ Workflow: `npm ci` → lint → typecheck → tests, report as artifact
- [ ] PR = `@smoke` on `api` + `chromium`; nightly = full suite, full browser matrix. Both `ENV=dev` (the only one); a second env would just be a second value in the job
- [ ] 🏢 **GitHub Environment per `ENV`** (start with `dev`), holding that env's secrets; the job picks it with `environment:`. Same workflow, different target
- [ ] `concurrency` group: a new push cancels the old run
- [ ] Sharding matrix + `merge-reports`; `failOnFlakyTests` on main
- [ ] Install only the browsers **each job** uses (PR: Chromium; nightly: the full matrix)

### Quality gates
- [ ] ⭐ ESLint + **`eslint-plugin-playwright`** + `no-floating-promises`; `tsc --noEmit`
- [ ] ⭐ `forbidOnly: !!process.env.CI`
- [ ] ⭐ npm scripts: `test`, `test:smoke`, `test:api`, `test:e2e`, `lint`, `typecheck`, `report`
- [ ] Prettier (`format`, `format:check`), husky + lint-staged pre-commit
- [ ] 🏢 `CODEOWNERS`: who reviews which folder (`src/api/` → API owners). Shows how a shared framework is governed

### Roles & coverage types
- [ ] **Per-worker auth** + role **option fixture** (Strategy via DI) as the **single place** `storageState` is decided: `guest` vs `user`; second-session test (§15)
- [ ] Mocking edge cases: 500, empty state, slow response. ⚠️ **First check the site makes XHR calls** (§14)
- [ ] Cross-browser + mobile-web projects (§16); optional axe/visual

### AI workflow
- [ ] `CLAUDE.md` with the framework rules, 3 reusable prompts, agents for 1–2 tests, **`docs/ai-review.md`** (§18)

### Presentation
- [ ] ⭐ README: what it covers, **design decisions with trade-offs** (incl. "built to scale" + what a small project could skip), how to run, "what I'd add with more time"
- [ ] ⭐ README line: *"One environment (`dev` = the public site). To add one, drop `config/environments/pre.json` next to it and run `ENV=pre npm test`"*
- [ ] **ADRs** in `docs/adr/` + `CONTRIBUTING.md` (§19)
- [ ] CI badge + architecture diagram in the README
- [ ] ⭐ Clean history: small commits with clear messages (no prefixes, imperative: "Add …")

### ⚠️ Site quirks (automationexercise.com)
- [ ] **Ads + consent popup** (some in iframes) → block ad domains with `context.route` in a fixture. Domains seen (S1, Playwright MCP): `pagead2.googlesyndication.com`, `fundingchoicesmessages.google.com` (consent), `ep1.adtrafficquality.google`
- [ ] **API returns HTTP 200 even on errors**, the real code is in the body (`responseCode`) → assert on the body. Verify first, note in the README. **Interview line:** *"I'd raise this as a contract defect. Until it's fixed, the schema validates `responseCode` so it can't be missed."*
- [ ] **POST endpoints appear to take form fields, not JSON** (`createAccount`, `verifyLogin`, `searchProduct`) → `form` option. Verify first
- [ ] **`data-qa`** attributes **where present** (forms: login, signup, contact) → `testIdAttribute: 'data-qa'`; elsewhere `getByRole` / `getByText`
- [ ] **Server-rendered pages**: verified for `/products` (S1): no `/api/*` calls → nothing to mock there. Still to check: add to cart (§14)
- [ ] **One public environment only** → one env file, `config/environments/dev.json` (say so in the README)

---

## 1. Folder structure

**Starter kit** = the folders marked ⭐. 🏢 = Scale tier.

```
├── config/                        # ⭐ DATA ONLY, no secrets, validated by zod at startup
│   ├── environments/dev.json      #    base URLs: { "<app>": { "web": { "baseURL" }, "api": { "baseURL" } } } (the only env; add environments/pre.json when one exists)
│   └── routes.json                #    paths, same for every env: { "<app>": { "web": { "loginPath" }, "api": { "productsListPath" } } }
├── src/
│   ├── config/
│   │   ├── environments.ts        # ⭐ loader: dotenv → list config/environments/ → zod(process.env) → read environments/<ENV>.json + routes.json → zod → export env, routes (ONLY place dotenv is loaded)
│   │   └── paths.ts               # ⭐ ROOT_DIR, ENVIRONMENTS_DIR, ROUTES_FILE, envFile(name), AUTH_DIR: from the project root (ONLY place file paths are defined)
│   ├── ui/
│   │   ├── pages/                 # ⭐ page objects: readonly locators, user-intent methods, goto(routes.<app>.web.xPath)
│   │   └── components/            # ⭐ shared parts a page HAS: HeaderComponent, ProductCard, CartModal
│   ├── api/
│   │   ├── clients/               # ⭐ one class per resource: takes an APIRequestContext (baseURL = env.<app>.api.baseURL), paths from routes, returns the response, no assertions
│   │   └── models/                # zod schemas; TS types via z.infer (one source of truth)
│   ├── data/
│   │   ├── builders/              # buildUser({ ...overrides }): unique defaults
│   │   └── json/                  # static data for data-driven tests
│   ├── fixtures/
│   │   ├── ui.fixtures.ts         # ⭐ page objects, ad blocking (blockAds, reused by every context we open)
│   │   ├── api.fixtures.ts        # ⭐ API contexts (one per service) + clients (+ worker-scoped account)
│   │   ├── data.fixtures.ts       # 🏢 cleanup registry
│   │   ├── auth.fixtures.ts       # full framework: role option, per-worker storageState, secondSession
│   │   └── index.ts               # ⭐ exports `test` (browser specs), `apiTest` (API specs: no browser, no auth) + expect (+ 🏢 toMatchSchema)
│   ├── types/                     # shared types (Role, EnvName, User)
│   └── utils/                     # small pure helpers only (no Playwright wrappers)
├── tests/
│   ├── setup/                     # ⭐ auth.setup.ts / auth.teardown.ts; 🏢 global.setup.ts (env health check)
│   ├── ui/                        # ⭐
│   ├── api/                       # ⭐
│   └── e2e/                       # hybrid: API setup → UI verify
├── .github/
│   ├── workflows/                 # ⭐ ci.yml (PR, ENV=dev); later nightly.yml (full matrix, sharded)
│   └── CODEOWNERS                 # 🏢
├── docs/
│   ├── adr/                       # 0001-…, one decision each
│   ├── prompts/                   # reusable AI prompts
│   └── ai-review.md               # what the AI got wrong and how I caught it
├── .env.example                   # ⭐ ENV= (+ secrets later), no values
├── .nvmrc
├── CLAUDE.md                      # framework rules for AI tools
├── CONTRIBUTING.md                # conventions, tags, flaky policy
├── README.md                      # ⭐
├── playwright.config.ts           # ⭐
├── eslint.config.mjs              # ⭐
└── tsconfig.json                  # ⭐
```

**Rule:** tests → fixtures → pages/components/API clients/builders → config. Lower layers never import upper ones.

**Deliberately NOT included** (patterns from earlier frameworks replaced by Playwright features):

| Old pattern | Replaced by | Why |
| --- | --- | --- |
| Separate `locators/` files with XPath/`#id` strings | `getByRole`/`getByTestId` as `readonly` fields in the page | One place per page, user-facing, no stale-element layer |
| `BasePage` with `goto` in try/catch + `getPage()` | No BasePage (add one only at the Rule of Three) | Swallowing a navigation error hides the real failure; `page` is already injected |
| Assertion classes (`*Asserts extends BasePage`) | `expect` in tests; `expect.extend` custom matcher if a check repeats | Less inheritance, assertions stay visible in the test |
| Service that checks status and throws | Client returns the response; the test asserts | Negative tests (400/404) become possible |
| `request.newContext()` per call | One context per service per worker, from a fixture | No leaked contexts; baseURL/headers set once |
| `ConfigReader.read("BASEURL")` + `config.properties` | `config/environments/<env>.json` + `routes.json` validated by zod, imported as typed `env` / `routes` | A wrong key fails at startup, not as `null` mid-run; real types, autocomplete |
| `dotenv.config()` in many files | Loaded once in `src/config/environments.ts` | One source of truth |
| Hardcoded paths (`C:/Users/...`) | `paths.ts` resolved from the project root | Works on every machine and in CI |
| Builder class with a `withX()` per field | `buildUser({ ...overrides })` factory function | Same idea, a fraction of the code |
| Query strings built into URLs | Paths in `config/routes.json`, values via `params` | Playwright encodes them (emails with `+` or `&` don't break) |
| Separate TS interfaces + validation | zod schema, type from `z.infer` | The type and the validation can't drift apart |

## 2. Environments (large-system pattern)

```
.env / CI job: ENV=dev ──▶ list config/environments/*.json ──▶ zod(process.env) ──▶ read environments/dev.json + routes.json ──▶ zod ──▶ export env, routes
                              │ unknown ENV → throw "Valid: dev" (= the files found)
                              │ missing secret → throw "SECRET_X is required"
                                                       │ missing/misspelled key → throw with the path
playwright.config.ts: one project per service → chromium: env.<app>.web.baseURL · api: env.<app>.api.baseURL · metadata: { env: ENV }
```

| Piece | Rule |
| --- | --- |
| `config/environments/<env>.json` | One file per environment, **every app's service base URLs**, committed, no secrets. **Only `dev.json` exists**: one real environment, no duplicate files |
| Valid environments | **Discovered from the folder**: the `*.json` names in `config/environments/` (`routes.json` sits outside it, so it's never mistaken for an env). Adding `pre.json` = a new environment, **zero code change** |
| zod `EnvConfig` schema | `z.record(z.string(), z.object({ web: z.object({ baseURL: z.url() }), api: z.object({ baseURL: z.url() }) }))`: any number of apps, each with `web` + `api`. Type with `z.infer` |
| zod `Routes` schema | Same app → `web` / `api` shape, values are paths (`z.string().startsWith('/')`) |
| zod `ProcessEnv` schema | `ENV: z.enum(<names found>).default('dev')` + secrets (optional now, required where a site needs them) |
| Default | `dev`, **never `prod`**: a forgotten variable must never hit production |
| Only what differs | URLs (and timeouts if an env is slower) in the env files. Paths are the same everywhere → **one** `routes.json`. `testIdAttribute`, reporters → `playwright.config.ts` |
| dotenv | Loaded **inside** `environments.ts` (`quiet: true`), so `.env` locally and real env vars in CI behave the same |
| Honest | automationexercise has one public environment → one file. README says how to add more |
| Mock-task repo | Same loader, its own `config/environments/dev.json` + `routes.json` with SauceDemo data. Demo credentials read from env to show the secrets path |

Interview line: *"Config is one JSON per environment holding every service URL, validated with zod at startup. ENV picks the file and defaults to dev, never prod; the valid names are just the files that exist, so a new environment is a new file. Secrets come from the environment and go through the same schema. Paths live once in routes.json, because they don't change between environments."*

## 3. Locator strategy

1. `getByRole(role, { name })`: what the user sees, plus accessibility
2. `getByLabel` / `getByPlaceholder` / `getByText`
3. `getByTestId` (`data-qa` here **where present**, `data-test` on SauceDemo)
4. CSS last.

- **Avoid by default:** XPath, `nth()`, positional selectors. **Allowed with a comment** when order *is* the behaviour ("the first search result", "sorted by price").
- Narrow down with `filter({ hasText })` and chaining (`row.getByRole('button')`).
- Locators are `readonly` fields in page objects.

## 4. Page objects & components

- **No outcome assertions** in pages. Allowed: sync guards (wait until the page is ready).
- **Composition over BasePage:** a page *has* a `HeaderComponent`.
- **No anemic wrappers:** methods are **user intents** (`login(user)`, `addToCart(name)`).
- `goto()` is a method, not in the constructor, and uses **`routes.<app>.web.xPath`** relative to `baseURL`. No full URL in a page.
- At scale: components are the reuse unit across teams; a new page is mostly composition of existing components.

## 5. API layer (the showcase)

- **One client per resource**, grouped per service. It takes an `APIRequestContext` and returns responses or parsed data. **No assertions inside.**
- **One context per service**, created in a worker-scoped fixture with `baseURL: env.<app>.api.baseURL` (+ headers). A second service = one more context + its URL in the JSON. Disposed after `use()`.
- Paths from **`config/routes.json`** (`routes.<app>.api.xPath`); query values via `params`, never string-built.
- POST bodies on this site are **form fields** (`form` option), not JSON (verify first).
- Every response has a **zod** schema; TS type via `z.infer`. 🏢 `toMatchSchema` custom matcher.
- API specs import **`apiTest`** (API fixtures only): no browser, no login (§15).
- Positive **and** negative cases. HTTP status is always 200: assert `body.responseCode`. **Never** `response.ok()` / `toBeOK()` / status 200 here: they can't fail on this site.

**Ready-made API cases.** ⚠️ From the site's API list, **not verified yet**. In S5, check each one against the live API **before** writing the test; note differences under "Issues found".

| Case | Expected `responseCode` |
| --- | --- |
| GET products list | 200 + products array (schema check) |
| POST to products list (wrong method) | 405 |
| Search product with a term | 200 + matching products |
| Search product without the parameter | 400 |
| Verify login, valid credentials | 200 |
| Verify login, missing email | 400 |
| Verify login, wrong credentials | 404 |
| Create account → get user by email → delete account | 201 → 200 → 200 (lifecycle, cleanup included) |

Interview line: *"One client per resource, one request context per service with its base URL from config. Clients return responses; tests assert. Every response goes through a zod schema, so a contract change fails loudly, even on an API that returns 200 for errors."*

## 6. Fixtures

| Kind | Use |
| --- | --- |
| Test-scoped (default) | Page objects, per-test data, `freshAccount` (create → `use` → delete) |
| **Worker-scoped** (`{ scope: 'worker' }`) | Expensive setup per worker: API contexts per service, a per-worker account. **Parallel-safe, not isolated**: never assume state you didn't create |
| **Option fixtures** (`{ option: true }`) | Values a project or test can override (`test.use({ role: 'user' })`) |
| Teardown (after `use()`) | Only for external effects: delete data, close contexts you opened (`try/finally` when a step could throw) |
| `mergeTests` | Combine `ui` + `api` (+ `data`, `auth`) fixture files into one `test` |
| 🏢 Cleanup registry | `cleanup.track(() => client.deleteAccount(email))` in the test; the fixture runs all tracked deletions after `use()`, even on failure |
| Contexts you open yourself | **Routes never carry over** → call `blockAds()`. **Options may be inherited**, incl. `storageState` → `browser.newContext({ baseURL: env.<app>.web.baseURL, storageState: undefined })` |

## 7. Auth

Accounts are **created by the tests themselves**, never a real or shared credential. Two stages:

| Stage | Pattern | Right while… |
| --- | --- | --- |
| **Starter kit** | Setup project creates **one** account and saves `storageState`; teardown project deletes it | logged-in tests **don't change server state** |
| **Full framework** | **Per-worker auth** (§15) | any logged-in test changes server state (cart, address, orders) |

**Starter kit steps:**
1. **Setup project** (`tests/setup/auth.setup.ts`, `test as setup` from `src/fixtures`, asks for `userClient` + `loginPage`): build a unique user → `createAccount` via API → log in through the UI once → `mkdirSync(AUTH_DIR, { recursive: true })` → save `USER_STATE` + `ACCOUNT_FILE`. Paths from `paths.ts`, gitignored.
2. **Teardown project** (`auth.teardown.ts`, linked with `teardown:`): read `ACCOUNT_FILE` (skip if missing) → `deleteAccount`. Log, don't assert.
3. Browser projects: `dependencies: ['setup']` + `storageState: USER_STATE`.
4. Login tests opt out: `test.use({ storageState: { cookies: [], origins: [] } })`.

**Full framework:** drop the setup/teardown projects and the opt-outs; the role fixture (§15) is the **only** place the session is decided.

At scale: roles are data (`guest`, `user`, later `admin`, `support`), each a session builder behind the same option fixture. Adding a role = one entry, no test changes.

## 8. Test data

- **Builders** with unique defaults (`crypto.randomUUID()`, not `Date.now()` alone) and overrides.
- Create **via API**, delete in teardown. 🏢 The cleanup registry makes that automatic.
- Static data in JSON (`resolveJsonModule`).
- **Accounts:** never shared across workers. Assert "contains the item", not "count = 1".

## 9. Writing tests

- `test.describe` + `beforeEach` for shared steps; fixtures for reusable setup.
- Tags: `{ tag: ['@smoke', '@cart'] }`. Suite × area: `--grep "@smoke"`, `--grep "@cart"`, `--grep "@smoke.*@cart"`.
- Data-driven: loop over JSON, one `test()` per row with a unique title.
- **Web-first assertions only.** No `waitForTimeout`.
- `waitForResponse` **only** when the UI gives no visible signal or you need the response data; start waiting **before** the click.
- Text from data: `toContainText(term, { ignoreCase: true })`, not `new RegExp(term)`.
- Every test must be able to fail. Prove it once.

## 10. Reporting & debugging

| Setting | Value |
| --- | --- |
| `reporter` | Local: `list` + `html`. CI: `list` + `html { open: 'never' }` + `junit`. Sharded: `--reporter=blob`, merged after |
| `metadata` | `{ env: ENV, urls: env }`: every report says where it ran |
| `screenshot` | `'only-on-failure'` |
| `trace` | `'on-first-retry'` |
| `retries` | CI 2, local 0 (retries **flag** flaky tests, they don't fix them) |
| `forbidOnly` | `!!process.env.CI` |
| `workers` | CI `2`, local default. Not the template's `1`: one worker never exercises parallel safety |

## 11. CI (GitHub Actions)

- **Triggers:** `pull_request` **and** `push` to `main` (I push straight to `main`).
- **Install:** `npm ci`, Node from `.nvmrc`.
- **PR:** lint + typecheck + `@smoke` on `api` + `chromium`, `ENV=dev`, Chromium only.
- **Nightly / main:** full suite, full browser matrix, `ENV=dev`. In a large system nightly targets `pre`: only the `ENV` value changes.
- 🏢 **GitHub Environment** per `ENV` (start with `dev`): holds its secrets; the job selects it with `environment:` and sets `ENV`. Same workflow file for every target.
- **`concurrency`:** cancel superseded runs.
- **Sharding:** `--shard=${{ matrix.shard }}/3 --reporter=blob` → `merge-reports` job.
- **Artifacts:** HTML report + traces, short `retention-days`. Repo is **private**; if it goes public, traces are still harmless because tests only use throwaway accounts.

## 12. Quality gates

- ESLint with `eslint-plugin-playwright` and `no-floating-promises`; `tsc --noEmit` in CI.
- npm scripts: `test`, `test:smoke`, `test:api`, `test:e2e`, `lint`, `typecheck`, `report`.
- Prettier (`format`, `format:check`) + Husky + lint-staged.
- 🏢 `CODEOWNERS` for the shared layers.

## 13. README (for the interviewer)

- What it covers, CI badge, **architecture diagram** (the layers + the config flow from §2).
- **Design decisions**, each with its trade-off: config per environment + zod, composition vs BasePage, one client per service, API setup + UI verify, tagging strategy. For each "large-system" choice: **what a small project could skip**.
- **Issues found** on the site (200 on errors, ads, API codes that differ from the docs).
- How to run (incl. `ENV=dev npm test` and how to add an environment), npm scripts, "what I'd add with more time".

---

## 14. Network mocking (edge cases)

Mock only what the real backend can't give you on demand.

**⚠️ Step 0: check there's something to mock.** `page.route` only changes requests the **browser** makes. `/products` makes no `/api/*` calls (verified S1). Check add to cart in DevTools → Network → **Fetch/XHR**:
- **Real XHR whose result the UI shows** → mock those.
- **None** → put the mocking specs on a **single-page app that loads its data through an API**, and say why in the README.
- **Make each mock test fail once:** remove the `page.route` line. Still passes → the mock did nothing.

| Case | How |
| --- | --- |
| Server error | `route.fulfill({ status: 500 })` → error state |
| Empty state | `route.fulfill({ json: { products: [] } })` → "no results" |
| Slow response | `async route => { await new Promise(r => setTimeout(r, 3000)); await route.continue(); }` → loading state |
| Network down | `route.abort()` |

- The delay in "slow response" lives in the **mock**, not the test. The test still waits web-first.
- Register the route **before** the action; `test.use({ serviceWorkers: 'block' })` in mock specs.
- Ad/tracker blocking for every test via a fixture.

## 15. Roles + per-worker auth

automationexercise has **no admin role**, only guests and registered users. The patterns stay the same with honest scenarios. Lives in `src/fixtures/auth.fixtures.ts`.

| Piece | How |
| --- | --- |
| Per-worker account | `workerAccount` (worker-scoped) creates one account per worker via API, deletes it after |
| Per-worker session | `workerStorageState` logs it in **once** in its own context → `playwright/.auth/worker-<n>.json` |
| **Option fixture for the role** | `role: ['guest', { option: true }]`; `test.use({ role: 'user' })`. **Strategy pattern via DI** |
| **One place for the session** | The overridden `storageState` fixture: `user` → worker file, `guest` → empty |
| Second session | `secondSession`: same user, separate context `{ baseURL, storageState: undefined }` + `blockAds()` |
| Scenario that can fail | Add to cart in the main session → item visible in `secondSession` (only if the cart is server-side per user; **verify**) |

**Why not "user A's cart isn't visible to user B":** separate contexts always have separate sessions, so it passes even if the server is wrong.

**Trade-off:** a guest test still triggers one worker login per worker. API specs must not pay it: they import `apiTest`. Verify with `npm run test:api`: no browser starts.

## 16. Cross-browser & mobile web

- Projects: `chromium`, `firefox`, `webkit`, `Mobile Chrome` (`devices['Pixel 7']`), `Mobile Safari` (`devices['iPhone 13']`).
- PR: Chromium only; nightly: full matrix.
- Optional: `@axe-core/playwright` on 2–3 pages; one `toHaveScreenshot`.

## 17. Reliability & flaky-test policy

- `fullyParallel: true`, `workers: 2` on CI; own context per test; unique data; no shared mutable account; no assumed state.
- Retries only in CI (2), `trace: 'on-first-retry'`, `video: 'retain-on-failure'`.
- **Failure triage first:** environment (🏢 health check catches it before tests) → app (real bug) → test (flaky/locator).
- **Flaky policy** (`CONTRIBUTING.md`):
  1. **Find:** retried passes are *flaky* in the report; `failOnFlakyTests` on main.
  2. **Reproduce:** `--repeat-each=20`, read the trace.
  3. **Quarantine:** `test.fixme()` + reason + ticket link. Never delete the assertion.
  4. **Fix the root cause:** timing → web-first / `waitForResponse`; shared data → builders, per-worker accounts; third-party noise → ad blocking.

## 18. AI workflow

| Piece | What |
| --- | --- |
| `CLAUDE.md` / `AGENTS.md` | The framework rules for any AI: layers, locator order, no assertions in pages/clients, config rules, tags |
| Reusable prompts (`.claude/commands/` or `docs/prompts/`) | "Add a page object", "Write an API test for endpoint X", "Fix a flaky test" |
| Tooling | Playwright MCP (site checks before writing tests), ESLint MCP, Context7 (current docs), `typescript-lsp` |
| Playwright Test Agents | `npx playwright init-agents --loop=claude`: planner → generator → healer for 1–2 tests |
| **`docs/ai-review.md`** | What the AI got wrong and how I caught it |

## 19. Documentation

- **README:** how to run, structure, how to add a test (step by step), environments (`ENV`).
- **ADRs** in `docs/adr/` (context → decision → trade-off):
  `0001-config-per-environment-with-zod.md` · `0002-fixtures-over-basepage.md` · `0003-one-client-per-service.md` · `0004-api-data-setup-and-cleanup.md` · `0005-tagging-strategy.md` · `0006-mocking-scope.md` · `0007-per-worker-auth.md`
- **`CONTRIBUTING.md`:** naming, tags, where assertions go, flaky policy, PR checklist.

## 20. Interview prep (15 min daily)

Define it in 1–2 sentences, give one example from this framework, name one trade-off. Say "it depends" + the trade-off.

| Question | Section |
| --- | --- |
| What are fixtures and why use them over hooks / a BasePage? | 6 |
| Test vs worker scope? When is teardown needed? | 6 |
| Where do assertions go, and why not in page objects or API clients? | 4, 5 |
| BasePage: when is it fine, when is it a problem? Composition vs inheritance | 1, 4 |
| Your locator strategy, and when you'd break it | 3 |
| How does auto-waiting work? Why is `waitForTimeout` an anti-pattern? | 9 |
| How do you handle auth for many tests and several users? | 7, 15 |
| How do you keep tests parallel-safe? | 8, 15, 17 |
| One shared login account vs per-worker auth: when do you switch? | 7, 15 |
| Why do API specs import `apiTest` instead of `test`? | 5, 15 |
| A test is flaky in CI only. Walk me through it | 17 |
| Retries: help or harm? | 10, 17 |
| How do you structure API tests? Positive vs negative vs schema | 5 |
| When do you mock and when do you hit the real backend? | 14 |
| How do you manage environments and secrets? | 2 |
| **How would this framework scale to 10 teams, 5 services, 4 environments?** | Design goal, 2, 5, 9, 11, 12 |
| **Why JSON per environment + zod instead of a properties file / ConfigReader?** | 1, 2 |
| **A run fails with 200 red tests. How do you tell env vs app vs test?** | 17 (health check) |
| **Which parts are overkill for this site, and why build them anyway?** | Design goal |
| How would you set up CI for this suite? | 11 |
| How do you use AI for tests, and how do you catch tests that prove nothing? | 18 |
| Playwright vs Selenium / Cucumber: what changes in the framework? | 1 ("Deliberately NOT included") |

---

## Build order

### Starter kit (1–2 days) — before the test task

| # | Step | Done |
| --- | --- | --- |
| S1 | `npm init playwright@latest`, tsconfig, `.gitignore`, ESLint + `eslint-plugin-playwright`, npm scripts | ✅ (`.env*` rules + `.env.example` moved to S2) |
| S2 | `.env*` rules + `.env.example` (`ENV=`) · `npm i -D zod dotenv` · `config/environments/dev.json` (the only env) + `config/routes.json` · `src/config/paths.ts` (`ROOT_DIR`, `ENVIRONMENTS_DIR`, `ROUTES_FILE`, `envFile()`, `AUTH_DIR`) · `src/config/environments.ts` (dotenv → list `config/environments/*.json` → zod `process.env` → load env file + routes → zod schemas → `env`, `routes`) · `playwright.config.ts` wired (`api` + `chromium` projects with `baseURL` from `env`, `testIdAttribute: 'data-qa'`, `workers: 2` on CI, reporters, trace, `metadata`) | ⬜ (env rules, `.env.example`, zod + dotenv done) |
| S3 | 1 page object (paths from `routes`) + 1 component · ad-blocking fixture | ⬜ |
| S4 | UI fixtures + first UI spec (critical journey, tags `@smoke` + area) + 1 negative UI case | ⬜ |
| S5 | **Verify the API codes (§5) first**, then API paths in `routes.json` + API context per service (`baseURL: env.<app>.api.baseURL`) + 1 client + zod response schema + API fixture + `mergeTests` (`test` / `apiTest`); 1 positive + 1 negative API spec | ⬜ |
| S6 | Auth: setup project creates the account via API + saves `storageState`; teardown deletes it; login spec opts out (§7) | ⬜ |
| S7 | Minimal CI on `pull_request` + `push` to `main`: `npm ci` → lint → typecheck → smoke on `api` + `chromium` with `ENV=dev` → HTML report artifact | ⬜ |
| S8 | README from the §0 template + the "built to scale" decisions + "one environment, how to add one" | ⬜ |

**If time runs out:** cut S6 (explain it in "what I'd add") → S7 (template CI) → S8 (template README). **Never cut S5.**

### Mock test task (if day 2 happens) — time-box 3 hours, then review

In **its own repo** (copy the starter kit, its own `config/environments/dev.json` + `routes.json` with SauceDemo data, remove the automationexercise specs and API layer), on **saucedemo.com** (users `standard_user`, `locked_out_user`, `problem_user`; password `secret_sauce`, read from env to show the secrets path; `testIdAttribute: 'data-test'`):
1. Login: success + locked-out user (negative)
2. Sort products by price (low → high) and verify the order
3. Add 2 items → cart shows 2 → checkout → **"Item total" = sum of the two prices** (read from the page) and **"Total" = item total + tax** → order complete
4. Checkout with a missing field shows the error
5. README with decisions, assumptions and "what I'd add with more time"

### Full framework (after the task)

| # | Tier | Step | Done |
| --- | --- | --- | --- |
| 1 | 1 | Prettier, Husky + lint-staged, `.nvmrc` | ⬜ |
| 2 | 1 | More pages/components; Contact Us (upload + dialog) | ⬜ |
| 3 | 1 | Remaining API clients + zod schemas + the ready-made API cases (§5) | ⬜ |
| 4 | 1 | Builders + JSON + data-driven spec; cleanup in teardown | ⬜ |
| 5 | 1 | Hybrid e2e (API creates the account → UI logs in → verify) | ⬜ |
| 6 | 1 | Two tag axes everywhere, describe/hooks, `waitForResponse`, `test.step` | ⬜ |
| 7 | 1 | CI: `@smoke` on PR, full nightly | ⬜ |
| 8 | 1 | README (diagram, CI badge) + ADRs 0001–0005 + CONTRIBUTING | ⬜ |
| 9 | 2 | Mocking edge cases: **first check Fetch/XHR**; else a single-page app (§14) | ⬜ |
| 10 | 2 | Per-worker auth + role option fixture + `secondSession`; ADR 0007 | ⬜ |
| 11 | 2 | Cross-browser + mobile; nightly full matrix on a `schedule` | ⬜ |
| 12 | 2 | Sharding + `merge-reports`; videos/traces; `failOnFlakyTests` | ⬜ |
| 13 | 2 | AI workflow: prompts, agents for 1–2 tests, `docs/ai-review.md` | ⬜ |
| 14 | 🏢 | Environment health check in `globalSetup` (§2, §17) | ⬜ |
| 15 | 🏢 | `toMatchSchema` custom matcher (§5) | ⬜ |
| 16 | 🏢 | Cleanup registry fixture (§6, §8) | ⬜ |
| 17 | 🏢 | GitHub Environments per `ENV` + `concurrency` (§11) | ⬜ |
| 18 | 🏢 | `CODEOWNERS` (§12) | ⬜ |
| 19 | 3 | Optional: axe/visual, BDD, Allure | ⬜ |

## Definition of done (full framework)

- [ ] `lint`, `typecheck` and `format:check` are clean; the pre-commit hook runs them
- [ ] Every spec passes locally and in CI, and each one has been made to fail once on purpose
- [ ] No checks that can't fail on this site (`response.ok()`, status 200); no mutable account shared across workers
- [ ] CI runs on PRs **and** pushes to `main`, with more than one worker; API specs start no browser
- [ ] `ENV=dev` loads and validates; an unknown `ENV` fails with the list of files found; adding a `pre.json` works without code changes (try it once, then delete it)
- [ ] No full URL outside `config/environments/`; no secrets in the repo; no code in `config/` (JSON only)
- [ ] No `waitForTimeout`; no XPath/`nth` without a comment; no assertions in page objects or API clients
- [ ] **Every "large-system" pattern is explained** in an ADR or the README: what it buys at scale, what a small project could skip
- [ ] Fast, parallel and stable in CI (no flaky tests without a `fixme` + reason)
- [ ] **A new person can add a test in 10 minutes** using the README
- [ ] I can explain every folder and every ADR in 2 minutes without notes, **and answer "how does this scale?" for each layer**

## Optional extras

BDD (playwright-bdd) · visual tests (`toHaveScreenshot`) · accessibility (`@axe-core/playwright`) · HAR replay (`routeFromHAR`) · Allure

Docs: https://playwright.dev/docs/intro · Best practices: https://playwright.dev/docs/best-practices · Fixtures: https://playwright.dev/docs/test-fixtures · Auth: https://playwright.dev/docs/auth · Sharding: https://playwright.dev/docs/test-sharding · Agents: https://playwright.dev/docs/test-agents
