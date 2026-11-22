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
| `npm run test:api` | API project only. Fails with "project not found" until the `api` project exists |
| `claude mcp add <name> -- <cmd>` / `claude mcp remove <name>` | Add / remove an MCP server for Claude. `--` only when `<cmd>` has its own flags |
| `npm install -g <pkg>` | Installs globally (this machine), not into the project |
| `/plugin install …` → `/reload-plugins` | Installs a Claude Code plugin and loads it |
| `gh auth login --scopes workflow` → `gh auth setup-git` | GitHub login for git, works in any terminal |

### Key ideas
- **A check that can't fail proves nothing.** Make every test, and the linter, fail once on purpose
- **Typed config vs. env vars.** URLs live in `src/config/environments.ts` (committed). `.env` holds only secrets and the `SITE` selector
- **Ignore before it exists.** A `.gitignore` rule protects a file the moment it appears. A committed secret stays in history
- **Playwright never type-checks.** `typecheck` and `lint` are separate gates, and CI runs both

### Interview lines
Say these out loud until they're automatic.

- *"Non-secret config is typed and versioned. Secrets come from the environment and are validated at startup."*
- *"Playwright transpiles but never type-checks, so `tsc --noEmit` runs in CI. ESLint's type-aware rules like no-floating-promises need tsconfig to know what returns a Promise."*
- *"Retries flag flaky tests, they don't fix them."*

### Gotchas
| Symptom | Fix |
| --- | --- |
| `git push`: `ECONNREFUSED …vscode-git….sock` | Dead VS Code login helper → `gh auth login` + `gh auth setup-git` |
| Wrong-case `.gitignore` entry still "works" | Only on the Windows drive. Linux/CI is case-sensitive |
| ESLint "passes" with `ESLintEmptyConfigWarning` | The config file is empty: nothing was checked |
| Empty files like `playwright` appear in the root | Pasted npm output into the terminal: a line starting with `>` is a shell redirect and creates an empty file. Delete them, paste only the command |
| New MCP server not visible | Restart Claude Code |
| Playwright MCP: `'chrome' is not found` | Re-add with `--browser chromium` |

### Takeaways
#### S1
- Prove every check can fail.
- Copy, then adapt: old configs carry old paths.
- Exact names: `Claude.local.md` ≠ `CLAUDE.local.md` on Linux.
- Restart Claude Code after MCP changes.

### Deep dives
| File | Covers |
| --- | --- |
| [Framework Initiation](docs/me/Framework%20Initiation.md) | **The project:** setup order, `.gitignore`, config vs. env vars, template config vs. ours, tsconfig + ESLint line by line, npm scripts |
| [Tooling](docs/me/Tooling.md) | **The machine:** inventory (everything installed + exact commands), MCP servers + plugin, git login + tokens, every problem we hit |
| [Site Notes](docs/me/Site%20Notes.md) | **The site:** what we found on automationexercise (server-rendered, ad domains) |
