# Playwright + TS framework

UI + API test framework for [automationexercise.com](https://automationexercise.com). Work in progress: the full README (how to run, structure, design decisions) comes in step S8.

---

## 📌 My notes

Things to come back to. Claude adds them as we go.

### Commands
First use only, not every run.

| Command | What it does | Step |
| --- | --- | --- |
| `node -v` | Prints the installed Node version (here v26.13.1). Later pinned in `.nvmrc` | S1 |
| `npm -v` | Prints the installed npm version (here 11.20.0) | S1 |
| `git init` | Creates an empty git repo (the `.git/` folder) in the current folder | S1 |
| `git add .` | Stages every file that isn't ignored | S1 |
| `git commit -m "…"` | Saves the staged files as one commit. Use prefixes: `chore:`, `feat:`, `test:`, `docs:` | S1 |
| `git branch -M main` | Renames the current branch to `main` | S1 |
| `git remote add origin <url>` | Links the local repo to the GitHub repo | S1 |
| `git push -u origin main` | Uploads commits. `-u` remembers the remote, so next time just `git push` | S1 |
| `git rm --cached <file>` | Stops tracking a file but keeps it on disk (needed after adding it to `.gitignore`) | S1 |
| `npm i -D <packages>` | Installs packages as **dev dependencies** (tools like eslint, typescript), saved in `package.json` | S1 |
| `npm run typecheck` | Runs `tsc --noEmit`: type-checks every file in tsconfig `include`, writes no output | S1 |
| `npm run lint` | Runs `eslint .`: checks code patterns (missing `await`, `test.only`…) | S1 |
| `npx playwright test` | Runs all tests on all projects (browsers). `--project=chromium` for one | S1 |
| `claude mcp add <name> --scope project -- <cmd>` | Registers an MCP server for Claude Code in `.mcp.json` (committed, shared). Restart Claude Code to load it, check with `/mcp`. Without `--scope project` it's saved only for you (local). `--` is needed only when the server command has its own flags | S1 |
| `claude mcp remove <name>` | Removes an MCP server (e.g. to re-add it with other flags) | S1 |
| `npm install -g <packages>` | Installs globally (on your PATH, for every project), not into this project. Used for `typescript-language-server` | S1 |
| `/plugin install typescript-lsp@claude-plugins-official` | (in Claude Code) Installs the TypeScript code-intelligence plugin: types, go to definition, references | S1 |
| `/reload-plugins` | (in Claude Code) Loads newly installed plugins without a restart | S1 |
| `/mcp` | (in Claude Code) Shows the MCP servers and whether they're connected | S1 |
| `npm init playwright@latest` | Scaffolds Playwright: installs `@playwright/test`, writes `playwright.config.ts` + an example test, downloads browsers | S1 |

### Setup inventory
What's installed and connected, and the exact command used. Rebuild a machine from this list.

#### Project packages (dev dependencies, in `package.json`)
| Package | What it's for | Installed with |
| --- | --- | --- |
| `@playwright/test` | The test runner + browser automation | `npm init playwright@latest` |
| `@types/node` | Node types (`process`, `path`, `fs`) for TypeScript | `npm init playwright@latest` |
| `typescript` | The compiler, for `npm run typecheck` | `npm i -D typescript` |
| `eslint` | The linter | `npm i -D eslint` |
| `typescript-eslint` | ESLint for TS + type-aware rules (`no-floating-promises`) | `npm i -D typescript-eslint` |
| `eslint-plugin-playwright` | Playwright rules (`test.only`, `waitForTimeout`, missing `await` on `expect`) | `npm i -D eslint-plugin-playwright` |

#### Browsers
| Browser | For | Installed with |
| --- | --- | --- |
| Chromium, Firefox, WebKit | The test projects in `playwright.config.ts` | `npm init playwright@latest` (browser step) |

#### Global tools (on this machine, not in the project)
| Tool | What it's for | Installed with |
| --- | --- | --- |
| `typescript-language-server` + `typescript` | Needed by the `typescript-lsp` Claude Code plugin | `npm install -g typescript-language-server typescript` |

#### Claude Code: MCP servers (all **local scope**, saved in `~/.claude.json`, not in the repo)
| Server | What it gives Claude | Command used |
| --- | --- | --- |
| `playwright` | A real browser: open pages, snapshots, clicks, network requests. Check locators and site quirks before writing tests | `claude mcp add playwright -- npx @playwright/mcp@latest --browser chromium` |
| `eslint` | Lint single files, with rule explanations | `claude mcp add eslint -- npx @eslint/mcp@latest` |
| `context7` | Current library docs (Playwright, typescript-eslint, zod) instead of outdated memory | `claude mcp add context7 -- npx -y @upstash/context7-mcp` |

#### Claude Code: plugins
| Plugin | What it gives Claude | Command used |
| --- | --- | --- |
| `typescript-lsp` | Code intelligence: types, go to definition, find references | `/plugin install typescript-lsp@claude-plugins-official` → `/reload-plugins` |

Check it all: `/mcp` (servers connected?), `npm run typecheck`, `npm run lint`, `npx playwright test`.

### Deep dives
Longer notes on one topic, in `docs/me/`.

- [Framework Initiation](docs/me/Framework%20Initiation.md): setup order, what the installer creates, `.gitignore` rules, template config vs. ours
- [AI Tooling](docs/me/AI%20Tooling.md): MCP servers (playwright, eslint, context7), the TypeScript LSP plugin, scopes, the `--` separator, issues we hit

### Key ideas
- **Typed config vs. env vars:** URLs and site settings live in `src/config/environments.ts` (committed). `.env` holds only secrets and the `SITE` selector. `.env.example` lists the names, no values (S1)

- **Playwright never type-checks:** it strips the types and runs the JS. Only `tsc --noEmit` (`npm run typecheck`) catches type errors, so CI must run it (S1)
- **MCP vs. plugin:** an MCP server gives Claude extra tools (browser, ESLint, docs). The TypeScript integration is an LSP **plugin** instead, so there's no separate "TypeScript MCP" (S1)
- **automationexercise is server-rendered:** `/products` makes no `/api/*` calls, so there's nothing to mock there with `page.route`. Checked with the Playwright MCP (S1)
- **Ad/consent domains to block (S3 fixture):** `pagead2.googlesyndication.com`, `fundingchoicesmessages.google.com` (consent popup), `ep1.adtrafficquality.google` (S1)

### Gotchas
Things that bit us once.

- Playwright MCP fails with `Chromium distribution 'chrome' is not found`: it defaults to Google Chrome. Add it with `-- npx @playwright/mcp@latest --browser chromium` (the `--` is needed because of the `--browser` flag) (S1)
- MCP server added but Claude can't see it: servers load only at startup. Restart Claude Code, check with `/mcp` (S1)
- `.playwright-mcp/` folder appears in the repo: the MCP's snapshots and logs. Gitignore it (S1)
- ESLint with an empty config file "passes" (just a warning): no rules = nothing checked. A check that can't fail proves nothing (S1)
- tsconfig copied from an old project: `include` pointed at folders that don't exist here. Check every copied path (S1)
- `git pull` fails with `ECONNREFUSED …vscode-git….sock`: the VS Code terminal's login helper is dead. Open a new terminal, or set up `gh auth login` + `gh auth setup-git` once (S1)
- `.gitignore` names are case-sensitive on Linux/CI. On the Windows drive (`/mnt`) a wrong case still "works", so it hides the bug (S1)

### Takeaways

#### Setup
- `CLAUDE.md` holds the rules for any AI and is committed with the repo. `CLAUDE.local.md` holds personal ways of working and is gitignored.
- Claude's memory is saved per project folder, so the rules have to live in files to carry over to a new repo.
