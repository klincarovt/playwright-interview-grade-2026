# Playwright + TS framework (automationexercise.com)

Rules for any AI tool working in this repo. The full checklist and build order are in `docs/ai/Solo Project - Senior Framework.md`.

## Goal: senior grade, built to scale
This is a **showcase framework**: it's built the way a senior would build it for a **large system** (many environments, many services), while still working for a small one. Some patterns are more than automationexercise strictly needs. That is deliberate: the point is to learn them and show them in an interview.
- **This applies to the whole project, every layer:** config, pages/components, API clients + schemas, test data, fixtures, auth/roles, tagging, reporting, CI, docs. Each one is designed as if many teams, services and environments depended on it.
- Prefer the pattern that scales over the shortest code.
- Every "more than needed" choice gets one line in the README or an ADR: what it's for in a large system, and what a small project could skip.
- Scalable, not fake: never invent behaviour the site doesn't have, and don't duplicate files to look big (one real environment = one config file). Where a pattern runs ahead of the site, say so plainly.

## Layers
- tests → fixtures → pages/components/API clients/builders → config. Lower layers never import upper ones.
- `src/config/environments.ts` is the only place dotenv is loaded. `src/config/paths.ts` is the only place file paths are defined (from the project root via `__dirname`, never hardcoded).
- **Code vs data:** all TypeScript lives in `src/` (and `tests/`). `config/` holds JSON only: tsconfig `include` doesn't cover it, so code there is never type-checked.
- **Config mimics a large system** (`config/`, data only, validated with zod at startup by `src/config/environments.ts`):
  - `config/environments/<env>.json` = **base URLs**, per app, per service. Changes per environment. Only `environments/dev.json` exists (one real environment). Valid `ENV` values = the files in `config/environments/`, so a new environment is a new file, no code change. `ENV` defaults to `dev`, never `prod`.
  - `config/routes.json` = **paths**, per app, per service. The same for every environment, so it's one file (no copies per env).
  - Shape: top-level keys are **apps** (`automationexercise`, later e.g. `admin`); inside each app the **services** `web` and `api`, same names in every app.
  - **Naming:** a key holding a full URL ends in `URL` (`baseURL`); a key holding a path ends in `Path` (`loginPath`), and the value starts with `/`. No app prefixes on keys (`atmWebURL`): the app key is the namespace.
  - No placeholder entries (`"otherApp": {}`): the schema already allows any number of apps; an incomplete entry fails at startup.
- No full URL outside `config/environments/`. Pages use `page.goto(routes.<app>.web.xPath)` relative to `baseURL`. One Playwright project per service, each with its own `baseURL`: `api` + `chromium` while there's one app; with more apps prefix the app (`admin-api`) and select with `--project='*-api'`.

## Page objects & components
- Locators are `readonly` fields. Methods are user intents (`login(user)`), not wrappers around `click()` or `fill()`.
- No outcome assertions in pages. Composition over a BasePage (add one only at the Rule of Three).
- Locator order: `getByRole` → `getByLabel` / `getByText` → `getByTestId` (`data-qa`) → CSS. No XPath. Use `nth()` only with a comment explaining why.

## API layer
- One client per resource. It returns responses and never asserts.
- One request context per service, created in a fixture, `baseURL` from `env.<app>.api.baseURL`.
- Paths come from `config/routes.json` (`routes.<app>.api.xPath`). Query values go through `params`. POST bodies use `form`.
- The site returns HTTP 200 even on errors, so assert `body.responseCode`. Never assert `response.ok()` or status 200.
- API specs import `apiTest` (no browser, no login).

## Tests
- Web-first assertions only. No `waitForTimeout`, no `test.only`.
- Test data is unique per test or per worker (builders with `crypto.randomUUID()`). Never assume state another test left behind.
- Every test has to be made to fail once on purpose.
- Tags on two axes: suite (`@smoke`, `@regression`) + area (`@auth`, `@cart`, `@products`, `@api`).

## Secrets
- Secrets only come from env vars. `.env*` (except `.env.example`) and `playwright/.auth/` are gitignored.
- File names in config files (`.gitignore`, imports, paths) use the exact case. CI runs on Linux, which is case-sensitive.
- Tests use throwaway accounts they create themselves, never a real credential.
