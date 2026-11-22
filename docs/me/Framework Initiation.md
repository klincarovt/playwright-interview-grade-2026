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

## One-liners
- URLs live in typed config. `.env` holds secrets and selectors.
- `package-lock.json` is committed, `node_modules/` is not.
- `.gitignore` first, commit second.
- File names in config files: exact case, always.
