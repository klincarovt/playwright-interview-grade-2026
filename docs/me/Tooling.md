# Tooling

Everything on the machine around the project: what's installed, the AI tools (MCP + plugin), git login, and the problems we hit. The project's own config is in [Framework Initiation](Framework%20Initiation.md).

## 1. Inventory
Rebuild a machine from this list. Keep it current.

| Kind | Name | What it's for | Installed with |
| --- | --- | --- | --- |
| Package | `@playwright/test`, `@types/node` | Test runner + Node types | `npm init playwright@latest` |
| Package | `typescript`, `eslint`, `typescript-eslint`, `eslint-plugin-playwright` | Compiler, linter, TS rules, Playwright rules | `npm i -D eslint typescript-eslint eslint-plugin-playwright typescript` |
| Browsers | Chromium, Firefox, WebKit | The test projects | `npm init playwright@latest` (browser step) |
| Global | `typescript-language-server` + `typescript` | Needed by the `typescript-lsp` plugin | `npm install -g typescript-language-server typescript` |
| MCP (local) | `playwright` | Claude gets a real browser: pages, clicks, network requests | `claude mcp add playwright -- npx @playwright/mcp@latest --browser chromium` |
| MCP (local) | `eslint` | Claude lints single files, with rule explanations | `claude mcp add eslint -- npx @eslint/mcp@latest` |
| MCP (local) | `context7` | Claude reads current library docs, not outdated memory | `claude mcp add context7 -- npx -y @upstash/context7-mcp` |
| Plugin | `typescript-lsp` | Claude gets types, go to definition, references | `/plugin install typescript-lsp@claude-plugins-official` → `/reload-plugins` |
| Login | GitHub CLI | git push/pull in any terminal | `gh auth login --scopes workflow` → `gh auth setup-git` |

- **Package** = dev dependency in `package.json`, restored by `npm ci`. **Global** = this machine only.
- **Health check** after any setup change: `npm run typecheck` → `npm run lint` → `npm test` → `/mcp`.

## 2. MCP servers and plugins

```
Claude Code ──asks──▶ MCP server ──▶ real tool (browser, ESLint, docs)
            ◀─result──
```

| | MCP server | Plugin (LSP) |
| --- | --- | --- |
| Gives Claude | Extra **tools** (open a browser, lint a file, fetch docs) | **Code intelligence** (types, go to definition, references) |
| Ours | playwright, eslint, context7 | typescript-lsp |

- **Context7** matters because libraries change faster than Claude's memory. Example: `tseslint.config()` is deprecated in favour of `defineConfig()`.
- **No "TypeScript MCP"**: the LSP plugin *is* the TypeScript integration. Whole-project type errors still come from `npm run typecheck`.

### Scope: who gets the server
| Scope | Saved in | Committed? | Use when |
| --- | --- | --- | --- |
| **local** (default, **ours**) | `~/.claude.json`, this folder | No | Just you |
| project (`--scope project`) | `.mcp.json` in the repo | Yes | Everyone who clones the repo |
| user (`--scope user`) | `~/.claude.json`, all folders | No | You, in every project |

### The `--` separator
```
claude mcp add playwright -- npx @playwright/mcp@latest --browser chromium
                          ▲                             ▲
          everything after is the server's command    so this flag goes to the server
```
Only needed when the server command has its own flags.

## 3. Git login (WSL → GitHub over HTTPS)

GitHub doesn't accept your password over HTTPS. Git needs a **credential helper** to hand it a token.

```
git push ──asks──▶ credential helper ──▶ token ──▶ GitHub
                     ├─ VS Code socket (dies when VS Code restarts) ❌
                     └─ gh (GitHub CLI), any terminal ✅
```

| Token | Permissions for push + pull |
| --- | --- |
| `gh auth login` (ours) | Default `repo`, `read:org`, `gist` + **`--scopes workflow`** |
| Fine-grained (if made by hand) | **Only this repo**: Contents R/W, Workflows R/W, Metadata R |
| Classic | `repo` + `workflow` |

- **`workflow`** is needed to push changes to `.github/workflows/*.yml` (S7).
- **Least privilege:** one repo, expiry 30–90 days, not "never".

## 4. Problems we hit

| Symptom | Cause | Fix |
| --- | --- | --- |
| `ECONNREFUSED …/vscode-git-….sock` on pull/push | Terminal points git at a dead VS Code login helper | `gh auth login --scopes workflow` + `gh auth setup-git` |
| `Repository not found` on your own repo | No valid login + **private** repo. GitHub says 404, not 403, so private repos can't be discovered | Fix the login |
| MCP server added, Claude can't see it | Servers load only when Claude Code **starts** | Restart, check `/mcp` |
| `Chromium distribution 'chrome' is not found` | Playwright MCP defaults to **Google Chrome**. Installing Chromium doesn't change what it asks for | Re-add with `--browser chromium`, restart |
| `.playwright-mcp/` folder in the repo | MCP snapshots and console logs | Gitignored |
| Empty files `playwright`, `…@1.0.0` in the root | Pasted npm output: a line starting with `>` is a shell redirect and creates an empty file | Delete them. Paste only the command |
| Edits report `ENOENT` but still apply | `/mnt` is a Windows drive | Check the file before retrying |

## One-liners
- MCP = extra tools for Claude. Plugin = code intelligence.
- Change MCP config → restart Claude Code.
- `gh` as git's login helper → works in every terminal.
- Paste commands, never their `>` output.
