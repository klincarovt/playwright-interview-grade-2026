# AI Tooling (MCP servers + plugins)

What we connected to Claude Code, why, and what went wrong on the way.

## 1. What an MCP server is

```
Claude Code ──asks──▶ MCP server ──▶ real tool (browser, ESLint, docs)
            ◀─result──
```
An MCP server gives Claude **extra tools**. Without one, Claude can only read files and run commands. With the Playwright MCP it can open a real browser and look at the page.

## 2. What we added

| Server | What it gives Claude | Command |
| --- | --- | --- |
| **playwright** | Opens a real browser: page snapshots, clicks, network requests. Used to check locators and site quirks **before** writing tests | `claude mcp add playwright -- npx @playwright/mcp@latest --browser chromium` |
| **eslint** | Lints a file and explains the rules | `claude mcp add eslint -- npx @eslint/mcp@latest` |
| **context7** | **Current docs** for libraries (Playwright, typescript-eslint, zod). Claude's own knowledge has a cutoff and can be out of date: e.g. `tseslint.config()` is deprecated in favour of `defineConfig()`. Context7 fetches the docs as they are today | `claude mcp add context7 -- npx -y @upstash/context7-mcp` |

**TypeScript** isn't an MCP server. It's a Claude Code **plugin** (LSP = Language Server Protocol, the same thing VS Code uses for red squiggles and "go to definition"):
```
npm install -g typescript-language-server typescript
```
then in Claude Code: `/plugin install typescript-lsp@claude-plugins-official` → `/reload-plugins`. ✅ Installed and verified (Claude read the symbols of `example.spec.ts` through it).

**Why there's no "TypeScript MCP":** the LSP plugin *is* the TypeScript integration. An MCP server would only wrap the same language server again.

| Need | Tool |
| --- | --- |
| Types, "go to definition", "who calls this?" while reading code | `typescript-lsp` plugin |
| "Does the whole project type-check?" | `npm run typecheck` (`tsc --noEmit`) |
| Code patterns (missing `await`, `test.only`) | ESLint (+ eslint MCP) |

## 3. Scope: who gets the server

| Scope | Saved in | Committed? | Use when |
| --- | --- | --- | --- |
| **local** (default) | `~/.claude.json`, for this folder | No | Just you. **What we use** |
| project (`--scope project`) | `.mcp.json` in the repo | Yes | Everyone who clones the repo gets it (team setup) |
| user (`--scope user`) | `~/.claude.json`, all folders | No | You, in every project |

## 4. The `--` separator

```
claude mcp add playwright -- npx @playwright/mcp@latest --browser chromium
                          ▲                             ▲
            everything after this is the server's     so this flag goes to the server,
            command, not Claude Code's options        not to `claude mcp add`
```
Only needed when the server command has its own flags.

## 5. Issues we hit

| Symptom | Cause | Fix |
| --- | --- | --- |
| Server added, but Claude can't see it | MCP servers load only when Claude Code **starts** | Restart Claude Code, check with `/mcp` |
| `Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome` | Playwright MCP defaults to **Google Chrome**, not the Chromium your tests use | Re-add with `--browser chromium` |
| Installed Chromium, same error | The MCP still asked for Chrome by name. Installing a different browser doesn't change what it asks for | The flag, then restart |
| `.playwright-mcp/` folder appears in the repo | The MCP saves page snapshots and console logs there | Add it to `.gitignore` |

## One-liners
- MCP = extra tools for Claude. Plugin/LSP = code intelligence (types, references).
- Change MCP config → restart Claude Code.
- Context7 = docs as they are today, not as Claude remembers them.
