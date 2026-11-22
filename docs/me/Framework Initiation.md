# Framework Initiation (S1–S2)

The project's own setup: files, config, linting. Machine and AI tools are in [Tooling](Tooling.md).

## 1. Order of the first steps

```
git init  →  npm init playwright@latest  →  .gitignore  →  first commit
                                              ▲
                          must exist BEFORE the first commit
```

- A committed file stays in history even after you delete it. A leaked secret has to be **rotated**, not just removed.
- Ignoring a file git already tracks does nothing. You'd need `git rm --cached <file>`.

## 2. What `npm init playwright@latest` creates

| File | What it is | What we do with it |
| --- | --- | --- |
| `package.json` | Name, scripts, dependencies | Add our npm scripts (§7) |
| `package-lock.json` | Exact installed versions | **Commit it**. `npm ci` installs from it → same versions everywhere |
| `node_modules/` | Installed packages | Gitignored, rebuilt by `npm ci` |
| `playwright.config.ts` | Test runner config | Rewritten in S2 (§5) |
| `tests/example.spec.ts` | Demo test against playwright.dev | Proved the install works. Delete before S4 |
| `.github/workflows/playwright.yml` | Template CI file | Replaced in S7 |
| `.gitignore` | Playwright's output folders | We add our own entries (§3) |

## 3. `.gitignore`

| Rule | Example | Watch out |
| --- | --- | --- |
| Folder | `node_modules/` | — |
| Root only | `/test-results/` | A leading `/` = only at the repo root |
| Wildcard | `.env*` | Matches `.env`, `.env.local`, `.env.example` … |
| Exception | `!.env.example` | Must come **after** the rule it undoes. Later rules win |
| Exact name | `CLAUDE.local.md` | **Case-sensitive on Linux/CI.** On the Windows drive git ignores case (`core.ignorecase=true`), so a wrong case only *looks* like it works |

**Ignore before it exists.** A rule protects a file the moment it appears. Without it, the gap is: create `.env` → `git add .` out of habit → commit → secret in history. That's why `/playwright/.auth/`, `.claude/settings.local.json` and `.env*` are in there before the files exist.

## 4. Config (built like a large system)

### Three places, split by what changes
| | `config/environments/<env>.json` | `config/routes.json` | Env vars (`.env`, CI secrets) |
| --- | --- | --- | --- |
| Holds | **Base URLs**, per app, per service | **Paths**, per app, per service | **Secrets** + the **`ENV` selector** |
| Changes per environment? | Yes → one file per env | No → one file for all | Per machine / pipeline |
| Committed? | Yes | Yes | No. Only `.env.example` (`ENV=`) |

```
.env / CI: ENV=dev ──picks──▶ config/environments/dev.json ──┐
                                                             ├──▶ zod validates ──▶ env, routes
                              config/routes.json ────────────┘
page.goto(routes.automationexercise.web.loginPath)  →  baseURL + /login
```

### Our files
```json
// config/environments/dev.json        // config/routes.json
{                                       {
  "automationexercise": {                 "automationexercise": {
    "web": { "baseURL": "https://…" },      "web": { "loginPath": "/login", "productsPath": "/products" },
    "api": { "baseURL": "https://…/api" }   "api": { "productsListPath": "/productsList", … }
  }                                       }
}                                       }
```

### Rules
| Rule | Why |
| --- | --- |
| Top-level keys = **apps**, inside = services **`web`** / **`api`** | A large system has many apps per environment. Same shape everywhere → one zod schema validates them all |
| Full URL keys end in **`URL`**, path keys end in **`Path`** (value starts with `/`) | You see what a value is from its name |
| No app prefixes (`atmWebURL`) | The app key is already the namespace: `automationexercise.web.baseURL` |
| No placeholders (`"otherWebsite": {}`) | zod's `z.record` already allows any number of apps. An empty entry just fails validation |
| One env file only (`dev.json`) | The site has one environment. More files = duplication. A new env = a new file, no code change |
| Default `ENV` = `dev`, **never `prod`** | A forgotten variable must not touch production data. Prod is tested only in agreed windows, if at all (read-only smoke) |
| Env files in their own folder | Valid `ENV` names = the files in `config/environments/`, so `routes.json` is never mistaken for an environment |

### Compared with Java
`config.properties` + `ConfigReader.read("BASEURL")` → returns `null` on a mismatched key at runtime. Here: JSON + zod → a missing or misspelled key fails **at startup**, and the values are typed (autocomplete).

- `.env.example` = **the contract**: every variable the code reads, no values (`ENV=`).
- Still gitignore `.env`: the habit is the point, and `playwright/.auth/*.json` holds real session cookies.

## 5. Template config vs. ours (S2)

| Setting | Template | Ours | Why |
| --- | --- | --- | --- |
| `forbidOnly` | `!!process.env.CI` | same | A leftover `test.only` fails CI |
| `retries` | CI 2, local 0 | same | Retries **flag** flaky tests, they don't fix them |
| `workers` | CI **1** | CI **2** | With 1 worker, parallel bugs never show up in CI |
| `reporter` | `html` | `list` + `html` (+ `junit` on CI) | Readable console + a CI-readable file |
| `baseURL` | commented out | per project, from `env.<app>.web/api.baseURL` | Config, not code |
| `testIdAttribute` | not set | `'data-qa'` | Same in every env → config file, not env JSON |
| `projects` | chromium, firefox, webkit | one per service: `api` (no browser) + `chromium` (web). With a second app: prefix (`admin-api`), select with `--project='*-api'` | PR runs stay fast |
| dotenv | commented out | loaded only in `environments.ts` | One source of truth |

## 6. tsconfig + ESLint

```
your .ts files
   ├─▶ Playwright  → runs the tests, strips types, NEVER type-checks
   ├─▶ tsc         → "is the code type-correct?"   ← tsconfig.json
   └─▶ ESLint      → "is the code written safely?" ← eslint.config.mjs (+ tsconfig for types)
```

### tsconfig.json
| Option | Plain meaning | Why |
| --- | --- | --- |
| `target: "ES2022"` | JS version to compile to | Modern Node supports it |
| `module: "commonjs"` | Import system of the output (`require`) | Must match `"type": "commonjs"` in `package.json` |
| `strict: true` | All strict checks ("could be `undefined`") | Catches bugs before running. Reviewers check it |
| `esModuleInterop: true` | `import path from 'path'` works | Cleaner imports |
| `skipLibCheck: true` | Don't type-check `node_modules` | Faster, not your code |
| `types: ["node"]` | Load Node types (`process`, `path`, `fs`) | Else `process.env` is a type error |
| `resolveJsonModule: true` | `import data from './x.json'` | JSON test data |
| `include` | Which files TS knows about | Must match the real folders ↓ |

**A file outside `include`:**
| Tool | Result |
| --- | --- |
| `tsc --noEmit` | Skipped **silently** (unless an included file imports it) |
| ESLint `projectService` | Fails **loudly**: `… was not found by the project service` |
| `playwright test` | Runs fine, it never type-checks → CI must run `npm run typecheck` |

A folder in `include` that doesn't exist yet (`src` before S2) is fine. `tsc` only errors when **no** entry matches any file.

**That's why code never goes in `config/`:** it isn't in `include`, so `tsc` skips a `.ts` file there silently, and ESLint (`files: ['**/*.ts']`) fails on it. `config/` = JSON, code = `src/`.

### eslint.config.mjs
| Piece | Plain meaning |
| --- | --- |
| `ignores` | Skip generated folders (reports, results) |
| `files: ['**/*.ts']` | Type-aware rules only on TS files. Keeps `eslint.config.mjs` itself out of the project service |
| `recommendedTypeChecked` | Ready-made TS rules that use type info |
| `projectService: true` + `tsconfigRootDir` | Read tsconfig to learn the types |
| `no-floating-promises: 'error'` | Fail on a Promise without `await` |
| playwright `flat/recommended` on `tests/**` | No `test.only`, no `waitForTimeout`, `await` on `expect` |

**Why some rules need type info:** "no `test.only`" only needs the text. `no-floating-promises` must *know* that `page.goto()` returns a Promise and `page.locator()` doesn't. The text alone can't tell them apart.

### Proof it works
Removing `await` before `expect(page).toHaveTitle(...)` gave **two** errors:

| Rule | Proves |
| --- | --- |
| `@typescript-eslint/no-floating-promises` | Type info works. Also catches un-awaited page-object methods |
| `playwright/missing-playwright-await` | The Playwright plugin is active on `tests/**` |

## 7. npm scripts

| Script | Command | Why this way |
| --- | --- | --- |
| `test` | `playwright test` | Everything |
| `test:smoke` | `playwright test --grep @smoke` | Tag filter: the fast PR set |
| `test:api` | `playwright test --project=api` | The **project** has its own `baseURL` and no browser. A folder filter (`tests/api`) would run the API specs once **per browser project** |
| `test:e2e` | `playwright test --project=chromium` | Not `test:ui`: `--ui` is Playwright's UI mode |
| `report` | `playwright show-report` | Opens the last HTML report |
| `lint` | `eslint .` | |
| `typecheck` | `tsc --noEmit` | |

No `npx` inside scripts: npm adds `node_modules/.bin` to the PATH while a script runs.

## 8. File paths (`src/config/paths.ts`)

`path.resolve` / `path.join` take **many arguments**: each one is a step. A name goes **down** into that folder, `'..'` goes **up** one.

```
path.resolve(__dirname, '..', '..')     ≡   path.resolve(__dirname, '../..')
     src/config  →  src  →  root
```

| Rule | Why |
| --- | --- |
| Start from `__dirname` (the folder of *this* file) | Same on every machine and in CI. A hardcoded `/mnt/code/...` works only on yours |
| Climb to the root **once** (`ROOT_DIR`), then only go down | `path.join(ROOT_DIR, 'config', 'routes.json')`. A `'..'` after `'config'` would undo it |
| No `/` inside arguments | `path.join` adds the right separator (`/` Linux, `\` Windows) |
| The file must sit in `src/config/` | "Two up" only lands on the root from there |
| A helper builds env file paths: `envFile('dev')` | `environments.ts` asks for a path instead of building one, so paths stay in this one file |

## One-liners
- `.gitignore` first, commit second. Ignore before the file exists.
- URLs per env in `config/environments/`, paths once in `routes.json`. `.env` holds secrets and `ENV`.
- `package-lock.json` is committed, `node_modules/` is not.
- File names in config files: exact case, always.
- Playwright runs, `tsc` type-checks, ESLint checks patterns. Three different jobs.
