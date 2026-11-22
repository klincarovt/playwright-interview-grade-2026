# Playwright + TS framework (automationexercise.com)

Rules for any AI tool working in this repo. The full checklist and build order are in `docs/ai/Solo Project - Senior Framework.md`.

## Layers
- tests → fixtures → pages/components/API clients/builders → config. Lower layers never import upper ones.
- `src/config/environments.ts` is the only place dotenv is loaded. `src/config/paths.ts` is the only place file paths are defined.
- One repo targets one site. Site differences (`testIdAttribute`, URLs) are config, not code.

## Page objects & components
- Locators are `readonly` fields. Methods are user intents (`login(user)`), not wrappers around `click()` or `fill()`.
- No outcome assertions in pages. Composition over a BasePage (add one only at the Rule of Three).
- Locator order: `getByRole` → `getByLabel` / `getByText` → `getByTestId` (`data-qa`) → CSS. No XPath. Use `nth()` only with a comment explaining why.

## API layer
- One client per resource. It returns responses and never asserts.
- Paths come from `src/api/endpoints.ts`. Query values go through `params`. POST bodies use `form`.
- The site returns HTTP 200 even on errors, so assert `body.responseCode`. Never assert `response.ok()` or status 200.
- API specs import `apiTest` (no browser, no login).

## Tests
- Web-first assertions only. No `waitForTimeout`, no `test.only`.
- Test data is unique per test or per worker (builders with `crypto.randomUUID()`). Never assume state another test left behind.
- Every test has to be made to fail once on purpose.
- Tags: `@smoke`, `@regression`.

## Secrets
- Secrets only come from env vars. `.env*` (except `.env.example`) and `playwright/.auth/` are gitignored.
- File names in config files (`.gitignore`, imports, paths) use the exact case. CI runs on Linux, which is case-sensitive.
- Tests use throwaway accounts they create themselves, never a real credential.
