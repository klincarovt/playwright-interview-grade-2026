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
| `npm init playwright@latest` | Scaffolds Playwright: installs `@playwright/test`, writes `playwright.config.ts` + an example test, downloads browsers | S1 |

### Deep dives
Longer notes on one topic, in `docs/me/`.

- [Framework Initiation](docs/me/Framework%20Initiation.md): setup order, what the installer creates, `.gitignore` rules, template config vs. ours

### Key ideas
- **Typed config vs. env vars:** URLs and site settings live in `src/config/environments.ts` (committed). `.env` holds only secrets and the `SITE` selector. `.env.example` lists the names, no values (S1)

### Gotchas
Things that bit us once.

- `.gitignore` names are case-sensitive on Linux/CI. On the Windows drive (`/mnt`) a wrong case still "works", so it hides the bug (S1)

### Takeaways

#### 2026-11-22
- `CLAUDE.md` holds the rules for any AI and is committed with the repo. `CLAUDE.local.md` holds personal ways of working and is gitignored.
- Claude's memory is saved per project folder, so the rules have to live in files to carry over to a new repo.
