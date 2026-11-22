# Progress (for Claude)

JoJo's notes (commands, takeaways) live in `README.md` → "My notes". Deep dives live in `docs/me/`.

## Resume point
**S1 Part 2** (in progress). Done: `git init`, `npm init playwright@latest` (Node v26.13.1, npm 11.20.0, @playwright/test ^1.65.1), first `.gitignore`. Q1 + Q2 answered ✅.
Open:
- **Deferred by JoJo** (do when the related file is added): `.gitignore` fix `Claude.local.md` → `CLAUDE.local.md` (works only because `core.ignorecase=true` on /mnt); `.env*` + `!.env.example` + `.env.example` + Q3 when env config comes in (S2). Remind before the first `.env` is created.
- Run `npx playwright test --project=chromium` (example spec smoke check), delete `example.spec.ts` before S4
- Shorten `package.json` description (has Markdown in it)
- Then: tsconfig, ESLint + `eslint-plugin-playwright`, npm scripts
- Installer created `.github/workflows/playwright.yml`: keep, replace in S7. No commit yet.

## Step log
| Step | Date | Notes |
| --- | --- | --- |
| Setup | 2026-11-22 | Ways of working: `CLAUDE.md`, `CLAUDE.local.md`, README "My notes" |
| S1 Part 1 | 2026-11-22 | git init + Playwright init done. Case mismatch in `.gitignore` (exact-names weak spot again) |

## Weak spots (from the prep repo)
- `await` on own async methods (missed 4×) → ESLint `no-floating-promises` catches it
- Exact names matter (`BASEURL` vs `BASE_URL`, `productName` vs `product-name`)
- Isolation: a context is per **test**, not per spec file
- Retries flag flakiness, they don't fix it. Web-first assertions replace sleeps
- Failure triage: test / app / environment
- Check questions get skipped → ask them anyway
- Q3 (S1): put URLs in `.env`. Mixes up typed config (non-secret, committed) vs env vars (secrets + `SITE` selector). Re-check in S2. Also "no need to gitignore on a public site" → habit + `.auth` cookies
