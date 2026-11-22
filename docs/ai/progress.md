# Progress (for Claude)

JoJo's notes (commands, takeaways) live in `README.md` → "My notes". Deep dives live in `docs/me/`.

## Resume point
**S1, almost done.** Next, in order:
1. `.gitignore`: add `.playwright-mcp/` (MCP output, now untracked in root) and `.claude/settings.local.json`. Trailing newline missing at the end.
2. ✅ Lint proven to fail: removed `await` on `expect(...).toHaveTitle` → both `no-floating-promises` AND `playwright/missing-playwright-await` fired. `.gitignore` MCP entries added (by Claude, on request).
3. **Bulk commit** (nothing committed since `Init`): `chore: add tsconfig and ESLint with type-aware and Playwright rules` (+ `.gitignore` fixes + docs).
4. Rest of S1: npm scripts `test`, `test:smoke`, `test:api`, `test:e2e`, `report`; shorten `package.json` description (has Markdown in it).
5. Then S2. Before the first `.env` file: add `.env*` + `!.env.example` to `.gitignore`, create `.env.example` (`SITE=`).

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

## Issues faced (S1)
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

## Step log
| Step | Date | Notes |
| --- | --- | --- |
| Setup | 2026-11-22 | Ways of working: `CLAUDE.md`, `CLAUDE.local.md`, README "My notes" |
| S1 Part 1 | 2026-11-22 | git init + Playwright init + first push (`Init`). Case mismatch in `.gitignore` |
| S1 Part 2 | 2026-11-22 | tsconfig + ESLint working. MCP: playwright, eslint, context7 |
| S1 Tooling | 2026-11-22 | All MCP servers connected + `typescript-lsp` plugin verified. Site check via MCP: `/products` server-rendered, ad domains noted. Deep dive `docs/me/AI Tooling.md` |

## Weak spots
- `await` on own async methods (missed 4× in prep repo) → ESLint `no-floating-promises` catches it
- Exact names matter (`BASEURL` vs `BASE_URL`, `Claude.local.md` vs `CLAUDE.local.md`)
- **Copied, not adapted**: tsconfig `include` from the old project. Check every copied path against this repo
- tsconfig/ESLint options were copy-paste knowledge only. Explained in Framework Initiation §8. Ask "why is X in your tsconfig?" later
- Q3: put URLs in `.env` (typed config vs env vars). Re-check in S2
- Q4 + Q5: couldn't answer, answers given (Framework Initiation §7). **Re-ask after S2**
- Isolation: a context is per **test**, not per spec file
- Retries flag flakiness, they don't fix it. Web-first assertions replace sleeps
- Failure triage: test / app / environment
- Check questions get skipped → ask them anyway
- Gets overwhelmed by long multi-part replies (reacted "?????"): keep each reply to one task
