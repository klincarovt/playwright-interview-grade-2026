# Framework Initiation (S1–S2)

How the project gets set up, and why each piece is there.

## 1. Order of the first steps

```
git init  →  npm init playwright@latest  →  .gitignore  →  first commit
                                              ▲
                          must exist BEFORE the first commit
```

| Step | Why this order |
| --- | --- |
| `git init` first | Everything after it can be tracked |
| `.gitignore` before the first commit | A committed file stays in history even after you delete it. A leaked secret has to be **rotated**, not just removed |
| `.gitignore` doesn't untrack | Ignoring a file git already tracks does nothing. You'd need `git rm --cached <file>` |

## 2. What `npm init playwright@latest` creates

| File | What it is | What we do with it |
| --- | --- | --- |
| `package.json` | Project name, scripts, dependencies | Add the npm scripts (`test`, `lint`, …) |
| `package-lock.json` | Exact installed versions | **Commit it**. `npm ci` in CI installs from it → same versions everywhere |
| `node_modules/` | Installed packages | Gitignored, rebuilt by `npm ci` |
| `playwright.config.ts` | Test runner config | Rewritten in S2 (env config, reporters, workers) |
| `tests/example.spec.ts` | Demo test against playwright.dev | Run it once to prove the install works, delete before S4 |
| `.github/workflows/playwright.yml` | Template CI file | Replaced in S7 |
| `.gitignore` | Playwright's output folders | We add our own entries (see section 3) |

## 3. `.gitignore` rules

| Rule | Example | Watch out |
| --- | --- | --- |
| Folder | `node_modules/` | — |
| Root only | `/test-results/` | A leading `/` = only at the repo root |
| Wildcard | `.env*` | Matches `.env`, `.env.local`, `.env.example` … |
| Exception | `!.env.example` | Must come **after** the rule it undoes. Later rules win |
| Exact name | `CLAUDE.local.md` | **Case-sensitive on Linux/CI.** On a Windows drive git ignores case (`core.ignorecase=true`), so a wrong case only looks like it works |

## 4. Template config defaults vs. what we'll change (S2)

| Setting | Template | Ours | Why |
| --- | --- | --- | --- |
| `forbidOnly` | `!!process.env.CI` | same | A leftover `test.only` fails CI |
| `retries` | CI 2, local 0 | same | Retries **flag** flaky tests, they don't fix them |
| `workers` | CI **1** | CI **2** | With 1 worker, parallel bugs never show up in CI |
| `reporter` | `html` | `list` + `html` (+ `junit` on CI) | Readable console output + a CI-readable file |
| `baseURL` | commented out | from `src/config/environments.ts` | Config, not code |
| `projects` | chromium, firefox, webkit | `api`, `chromium` (more later) | PR runs stay fast |
| dotenv | commented out in the config | loaded only in `environments.ts` | One source of truth |

## 5. Where config goes: typed config vs. env vars

| | Typed config (`src/config/environments.ts`) | Env vars (`.env` locally, CI secrets) |
| --- | --- | --- |
| What | URLs, `testIdAttribute`, timeouts: **non-secret** settings | **Secrets** + **selectors** that pick which config to use (`SITE`, later `ENV`) |
| Committed? | Yes, typed and reviewed | No. Only `.env.example` (names, no values) |
| Why | Type-checked, versioned, one place to change | Different per machine/pipeline, must never reach git |

`.env.example` = **the contract**: every variable the code reads, with no values. A new person copies it to `.env` and fills it in. Here it's tiny (`SITE=`), because the tests create their own accounts. On SauceDemo it would also list `SAUCE_USERNAME=` / `SAUCE_PASSWORD=`.

**Why still gitignore `.env` on a public site?** The habit is the point. Also, `playwright/.auth/*.json` holds real session cookies, so it's private even when the site is public.

```
SITE (env var) ──picks──▶ environments.ts entry ──▶ baseURL, apiURL, testIdAttribute
SECRET (env var) ─────────▶ required('X') ──▶ throws early if missing
```

## 6. Git login from WSL (GitHub over HTTPS)

GitHub doesn't accept your account password over HTTPS. Git needs a **credential helper** to supply a token.

```
git push ──asks──▶ credential helper ──▶ token ──▶ GitHub
                     │
                     ├─ VS Code socket (only while that VS Code terminal is alive)
                     └─ gh (GitHub CLI), works in any terminal ✅
```

| Error | Meaning | Fix |
| --- | --- | --- |
| `ECONNREFUSED …/vscode-git-….sock` | The terminal points git at a dead VS Code socket | Open a new terminal, or switch to `gh` |
| `Repository not found` on a repo you own | No valid login + **private** repo. GitHub says 404 rather than 403, so private repos can't be discovered | Fix the login |

Lasting setup: `gh auth login` → `gh auth setup-git`.

## 7. tsconfig `include` + ESLint type info

```
                  reads include          strips types, runs JS
tsconfig.json ─────────────▶ tsc         Playwright ──▶ never type-checks
      │
      └──────────▶ ESLint projectService ──▶ type-aware rules (no-floating-promises)
```

| File outside `include` | Result |
| --- | --- |
| `tsc --noEmit` | Skipped **silently** (unless an included file imports it) → type errors never reported |
| ESLint `projectService` | Fails **loudly**: `… was not found by the project service` |
| `npx playwright test` | Runs fine: it doesn't type-check at all → that's why CI runs `npm run typecheck` |

A folder in `include` that doesn't exist yet (like `src` before S2) is fine. `tsc` only errors ("No inputs were found") when **no** entry matches any file.

| Rule kind | Needs | Example |
| --- | --- | --- |
| Syntax rule | Only the text | `no-focused-test` sees `test.only(` |
| Type-aware rule | Type info from tsconfig | `no-floating-promises` must know `page.goto()` returns a Promise. `page.locator()` doesn't, and the text alone can't tell them apart |

**Interview line:** *"Playwright transpiles but never type-checks, so `tsc --noEmit` runs in CI. ESLint's type-aware rules like no-floating-promises need tsconfig to know what returns a Promise."*

## 8. What tsconfig and ESLint do, line by line

```
your .ts files
   ├─▶ Playwright  → runs the tests (ignores types)
   ├─▶ tsc         → "is the code type-correct?"   ← tsconfig.json
   └─▶ ESLint      → "is the code written safely?" ← eslint.config.mjs (+ tsconfig for types)
```

### tsconfig.json
| Option | Plain meaning | Why |
| --- | --- | --- |
| `target: "ES2022"` | JS version to compile to | Modern Node supports it |
| `module: "commonjs"` | Import system of the output (`require`) | Must match `"type": "commonjs"` in `package.json` |
| `strict: true` | All strict checks on ("could be `undefined`") | Catches bugs before running. Reviewers check it |
| `esModuleInterop: true` | `import path from 'path'` works for old packages | Cleaner imports |
| `skipLibCheck: true` | Don't type-check `node_modules` | Faster, not your code |
| `types: ["node"]` | Load Node types (`process`, `path`, `fs`) | Else `process.env` is a type error |
| `resolveJsonModule: true` | `import data from './x.json'` | JSON test data |
| `include` | Which files TS knows about | Must match the real folders (§7) |

### eslint.config.mjs
| Piece | Plain meaning |
| --- | --- |
| `ignores` | Skip generated folders |
| `recommendedTypeChecked` | Ready-made TS rules that use type info |
| `projectService: true` | Read tsconfig to learn types |
| `tsconfigRootDir` | Where tsconfig lives |
| `no-floating-promises: 'error'` | Fail on a Promise without `await` |
| `playwright flat/recommended` on `tests/**` | No `test.only`, no `waitForTimeout`, `await` on `expect` |
| `allowDefaultProject: ['eslint.config.mjs']` | Lint the config file itself even though it isn't in tsconfig `include` |

## 9. Proving lint works

Removing `await` before `expect(page).toHaveTitle(...)` gave **two** errors:

| Rule | From | Proves |
| --- | --- | --- |
| `@typescript-eslint/no-floating-promises` | typescript-eslint | Type info works: ESLint *knows* this returns a Promise |
| `playwright/missing-playwright-await` | eslint-plugin-playwright | The Playwright plugin is active on `tests/**` |

Two rules for one mistake is fine. The first catches **any** un-awaited Promise (also your own page-object methods), the second gives a Playwright-specific message.

## One-liners
- URLs live in typed config. `.env` holds secrets and selectors.
- `package-lock.json` is committed, `node_modules/` is not.
- `.gitignore` first, commit second.
- File names in config files: exact case, always.
