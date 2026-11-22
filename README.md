# Playwright + TS framework

UI + API test framework for [automationexercise.com](https://automationexercise.com). Work in progress: the full README (how to run, structure, design decisions) comes in step S8.

---

## 📌 My notes

The important stuff only. Details live in [`docs/me/`](#deep-dives).

### Commands I ran
First use only.

| Command | What it does |
| --- | --- |
| `node -v` / `npm -v` | Installed versions (v26.13.1 / 11.20.0) |
| `git init` | Creates an empty repo |
| `npm init playwright@latest` | Scaffolds Playwright: package, config, example test, browsers |
| `git add .` → `git commit -m "Add …"` → `git push` | Stage → save a commit → upload. Message = short imperative sentence ("Add …", "Fix …") |
| `git remote add origin <url>` + `git push -u origin main` | Link to GitHub, first push. `-u` remembers it, so next time just `git push` |
| `npm i -D <pkg>` | Installs a dev dependency (a tool), saved in `package.json` |
| `npm run typecheck` / `npm run lint` | Type errors / code patterns (missing `await`, `test.only`) |
| `npx playwright test` | Runs all tests |
| `npm run test:api` | API project only: no browser starts |
| `npm i -D zod dotenv` | zod = schema validation (config, env vars, API responses) · dotenv = reads `.env` into `process.env` |
| `claude mcp add <name> -- <cmd>` / `claude mcp remove <name>` | Add / remove an MCP server for Claude. `--` only when `<cmd>` has its own flags |
| `npm install -g <pkg>` | Installs globally (this machine), not into the project |
| `/plugin install …` → `/reload-plugins` | Installs a Claude Code plugin and loads it |
| `gh auth login --scopes workflow` → `gh auth setup-git` | GitHub login for git, works in any terminal |
| `curl -s -w "\nHTTP status: %{http_code}\n" -X POST <url>` | Sends one HTTP request from the terminal and prints the real status (Postman without the UI) |
| `npx playwright test --project=chromium` | Runs only the browser project (its `baseURL`, ignores `tests/api/`) |
| `npx tsx -e "import * as paths from './src/config/paths'; console.log({ ...paths })"` | Runs a TS one-liner without installing anything. Quick check of what a file exports. `{ ...x }` so values print instead of `[Getter]` |

### Key ideas
- **A check that can't fail proves nothing.** Make every test, and the linter, fail once on purpose
- **Built like a large system.** Every layer is designed for many apps, services and environments. Overkill for this site on purpose, and each extra pattern gets one line on what a small project could skip
- **Split config by what changes.** Base URLs per environment in `config/environments/<env>.json`, paths once in `config/routes.json`, secrets + `ENV` in `.env`. zod validates it all at startup
- **Default `ENV` is `dev`, never `prod`.** A forgotten variable must not touch production data
- **Ignore before it exists.** A `.gitignore` rule protects a file the moment it appears. A committed secret stays in history
- **Playwright never type-checks.** `typecheck` and `lint` are separate gates, and CI runs both

### Interview lines
Say these out loud until they're automatic.

- *"I built it the way I'd build it for a large system: one config file per environment with every service URL, validated with zod at startup. The site has one environment, so there's one file; adding pre or prod is adding a JSON file, no code change."*
- *"Non-secret config is versioned and validated with zod at startup. Secrets come from the environment. A wrong key fails before any test runs, not as a null mid-run like a Java ConfigReader."*
- *"URLs change per environment, paths don't, so they live in separate files: no copies to keep in sync."*
- *"Playwright transpiles but never type-checks, so `tsc --noEmit` runs in CI. ESLint's type-aware rules like no-floating-promises need tsconfig to know what returns a Promise."*
- *"Retries flag flaky tests, they don't fix them."*
- *"External data is `unknown` until zod validates it, so the compiler won't let me use it unchecked."*
- *"Paths only know locations; the loader decides the environment after validating it."*
- *"No BasePage: shared parts are components that pages have. Inheritance only at the Rule of Three, because a BasePage tends to become a dumping ground."*
- *"I build paths with `path.join` from one root, never by string concatenation."*
- *"For one team I'd use a typed TS object. I built it with JSON + zod to show how it scales across environments and services."*

### Gotchas
| Symptom | Fix |
| --- | --- |
| `git push`: `ECONNREFUSED …vscode-git….sock` | Dead VS Code login helper → `gh auth login` + `gh auth setup-git` |
| Wrong-case `.gitignore` entry still "works" | Only on the Windows drive. Linux/CI is case-sensitive |
| ESLint "passes" with `ESLintEmptyConfigWarning` | The config file is empty: nothing was checked |
| Empty files like `playwright` appear in the root | Pasted npm output into the terminal: a line starting with `>` is a shell redirect and creates an empty file. Delete them, paste only the command |
| New MCP server not visible | Restart Claude Code |
| Playwright MCP: `'chrome' is not found` | Re-add with `--browser chromium` |
| `.gitignore` `*.env*` | Too broad: also hides any file with `.env` in its name. Use `.env*` |
| ESLint `no-unsafe-assignment` on `JSON.parse` | Type it `: unknown`, then let zod check it |
| `workers: … : ENV` compiles but is wrong | `workers` also accepts text (`'50%'`), so TS doesn't catch it. Use `undefined` |
| A `.ts` file in `config/` (happened twice) | `config/` is JSON only and not in tsconfig `include`: never type-checked, and ESLint fails on it. Code goes in `src/` |

### Takeaways
#### S1
- Prove every check can fail.
- Copy, then adapt: old configs carry old paths.
- Exact names: `Claude.local.md` ≠ `CLAUDE.local.md` on Linux.
- Restart Claude Code after MCP changes.

#### S2
- Two kinds of config: `.env` = which environment + secrets (local, never committed). `config/*.json` = URLs and paths (shared, committed).
- `paths.ts` climbs to the root once, then only goes down. `path.join`, never string-built paths.
- Outside data is `unknown` until zod checks it. TS types disappear at runtime, so `JSON.parse` alone can't catch `baseUrl` vs `baseURL`.
- One loader, run once: a bad `ENV` or a broken file stops the run at startup with the exact field.
- One Playwright project per service, each with its own `baseURL` and test folder.

#### S3
- A page object = locators (`readonly`) + user intents (`login()`), no assertions. Tests assert on its locators.
- A component owns one area: `root = page.getByRole('banner')`, then search only inside it. A page **has** a header (composition, no BasePage).
- Never hardcode: paths from `routes`, URLs from `baseURL`, secrets from env.
- `getByText`/`getByRole` names match **part** of the text → `'Cart'` also hits "Add to cart". Scope it or use the role.
- Add a locator only when a test uses it. Check the real page first (Playwright MCP / codegen).

#### S4 (part 1)
- A fixture = setup + `use()` (the test runs there) + teardown. Tests ask for it by name: `async ({ loginPage })`.
- Overriding the built-in `context` gives every page ad blocking (`route.abort()` cancels the request).
- `src/fixtures/index.ts` is the facade: tests import `test` + `expect` only from there, never from `@playwright/test`.
- Web-first `expect(...).toBeVisible()` retries for 5 s. Every test is made to fail once on purpose.

#### S5
- Verify the real API before writing tests (curl): HTTP is always 200, the real code is in the body → assert `body.responseCode`.
- `baseURL` + a path starting with `/` drops everything after the host → API `baseURL` = host only, paths carry `/api/...`.
- Client = how to call (no asserts) · fixture = builds it once per worker · test = calls + asserts.
- Responses are untrusted: `Schema.parse(await response.json())` checks the whole contract and gives a type (`z.infer`).
- `apiTest` = API fixtures only → no browser starts. `test` = `mergeTests(uiTest, apiTest)` → UI tests can use API clients too.

### Deep dives
| File | Covers |
| --- | --- |
| [Framework Initiation](docs/me/Framework%20Initiation.md) | **The project:** setup order, `.gitignore`, the config design (env files, routes, naming rules, vs. Java), template config vs. ours, tsconfig + ESLint line by line, npm scripts |
| [Environment Config](docs/me/Environment%20Config.txt) | **The config system end to end:** which file answers what, the loader flow, secrets, adding an environment, vs. Java |
| [API Layer](docs/me/API%20Layer.md) | **The API layer:** `baseURL` + path, HTTP 200 on errors, curl, clients, `form` / `data` / `params` |
| [Fixtures](docs/me/Fixtures.md) | **Fixtures:** what they are, our files, `index.ts` as the facade, ad blocking, `mergeTests` |
| [Tooling](docs/me/Tooling.md) | **The machine:** inventory (everything installed + exact commands), MCP servers + plugin, git login + tokens, what Claude can access, every problem we hit |
| [TypeScript Basics](docs/me/TypeScript%20Basics.md) | **The language:** every TS/Node concept we use, mapped to Java |
| [Site Notes](docs/me/Site%20Notes.md) | **The site:** what we found on automationexercise (server-rendered, ad domains) |
