# TypeScript Basics (for a Java developer)

Every language or Node concept we use in this project, mapped to Java. Added as we go.

| TypeScript / Node | Java equivalent | Where you've seen it |
| --- | --- | --- |
| `import path from 'path'` | `import java.nio.file.Paths;` (Node's built-in path tools) | `paths.ts` |
| `export const ROOT_DIR = …` | `public static final String ROOT_DIR = …` (other files can import it, nobody can reassign it) | `paths.ts` |
| `const x` / `let x` | `final var x` / `var x` | everywhere |
| `(name: string) => path.join(…)` | a lambda: `name -> …`. A function stored in a constant | `envFile` helper |
| `` `${name}.json` `` (backticks) | `name + ".json"` or `String.format("%s.json", name)` | `envFile` helper |
| `__dirname` | "the folder this class file is in" (no direct equivalent) | `paths.ts` |
| `import.meta.dirname` | the same thing, in ES-module files (`.mjs`) | `eslint.config.mjs` |
| `process.env.CI` | `System.getenv("CI")`. Unset → `undefined` (Java: `null`) | `playwright.config.ts` |
| `!!process.env.CI` | `System.getenv("CI") != null`: turns any value into `true` / `false` | `forbidOnly` |
| `cond ? a : b` | the same ternary | `retries: process.env.CI ? 2 : 0` |
| `await page.goto(…)` | `future.join()`: **wait** for the result. Without `await` the call runs in the background and the test moves on → the missing-`await` bug | `example.spec.ts`, the lint proof |

File paths (`path.resolve`, `path.join`, `'..'`): see [Framework Initiation §8](Framework%20Initiation.md#8-file-paths-srcconfigpathsts).
