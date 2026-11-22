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
| `import * as paths from './paths'` | `import static Paths.*`, but grouped under one name: `paths.ROOT_DIR` | `tsx` check |
| `import { envFile } from './paths'` | `import static Paths.envFile;`: just that one export | `environments.ts` |
| `{ ...obj }` (spread) | `new HashMap<>(obj)`: a copy. `{ ...obj, y: 3 }` = copy + override | `tsx` check, later builders |
| `[Getter]` in `console.log` | A value behind a getter method; spread `{ ...x }` reads it | `tsx` check |
| `{ path: X, quiet: true }` as an argument | An options object made on the spot, like passing a small settings map | `dotenv.config(…)` |
| `fs.readFileSync(file, 'utf-8')` | `Files.readString(path)`. Without `'utf-8'` you get bytes | `environments.ts` |
| `fs.readdirSync(dir)` | `Files.list(dir)`: the names in a folder → `['dev.json']` | `environments.ts` |
| `JSON.parse(text)` | Jackson `readValue`: text → object. **Not checked**, zod does that | `environments.ts` |
| `const x: unknown = JSON.parse(t)` | `Object x`: must be checked/cast before use. `any` = typing switched off (lint blocks it) | `environments.ts` |
| `arr.filter(f => …)` / `arr.map(f => …)` | `stream().filter(…)` / `.map(…)`, no `.stream()` / `.collect()` needed | `names` in `environments.ts` |
| zod: `z.object`, `z.enum`, `.default`, `z.url()`, `z.record`, `.parse()` | Bean Validation + Jackson in one: describe the shape, `.parse()` returns typed data or throws | `environments.ts` |
| `const { ENV } = obj` (destructuring) | `String ENV = obj.ENV;`: takes a field out into a constant with the same name | `environments.ts` |
| TS types are **erased** at runtime | Like Java generics (`List<String>` → `List`). That's why runtime data needs zod | `environments.ts` |
| `export class LoginPage { readonly x: Locator; constructor(page: Page) { this.x = … } }` | A Java class: `readonly` = `final`, `this` the same. No getters needed | `LoginPage.ts` |
| `constructor(private readonly page: Page)` | Declares + assigns the field in one go (`private final Page page; this.page = page;`) | shown in S3 |
| `async m(): Promise<void>` | Returns a `CompletableFuture<Void>` right away; `await` = `join()`. Every `async` method returns a Promise | page objects |
| `import type { Page } from …` | Imports only the type; erased at runtime | components |
| `new HeaderComponent(page)` as a field | Composition: the page **has** a header (`private final Header header = new Header(driver)`) | `LoginPage.ts` |
| `export { test } from './ui.fixtures'` | Re-export: passes it straight through (a facade) | `src/fixtures/index.ts` |
| `base.extend<{ loginPage: LoginPage }>(…)` | Generics, like `Map<String, LoginPage>`: tells TS which fixtures exist | `ui.fixtures.ts` |
| `crypto.randomUUID()` | `UUID.randomUUID().toString()` | `login.spec.ts` |
| `/a\|b/` (regex literal) | `Pattern.compile("a\|b")` | `AD_HOSTS` |
| `await page.goto(…)` | `future.join()`: **wait** for the result. Without `await` the call runs in the background and the test moves on → the missing-`await` bug | `example.spec.ts`, the lint proof |

File paths (`path.resolve`, `path.join`, `'..'`): see [Framework Initiation §8](Framework%20Initiation.md#8-file-paths-srcconfigpathsts).
