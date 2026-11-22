# API Layer

## `baseURL` + path (how Playwright joins them)
A path starting with `/` **replaces everything after the domain**, like a link in a browser.

```
baseURL https://automationexercise.com/api  +  /productsList  →  https://automationexercise.com/productsList   ❌ /api lost
baseURL https://automationexercise.com      +  /api/productsList  →  …/api/productsList                     ✅
```
**Rule:** `api.baseURL` = host only. Paths in `routes.json` carry the full route (`/api/...`). Scales: a separate API host (`api.company.com`) is just another `baseURL`.

## This site returns HTTP 200 on errors
Verified with curl (see `Site Notes.md`): `POST /api/productsList` → HTTP 200, body `responseCode: 405`.
- Assert `body.responseCode`. **Never** `response.ok()` / status 200: they pass even when the call failed.
- Interview: *"I'd raise it as a contract defect; until then the schema validates `responseCode` so it can't be missed."*

## curl (quick check from the terminal, Postman without the UI)
```bash
curl -s -w "\nHTTP status: %{http_code}\n" -X POST https://automationexercise.com/api/productsList
```
`-X POST` = method · `-s` = no progress bar · `-w "…%{http_code}"` = print the real HTTP status.

## A client (one class per resource)
- Takes an `APIRequestContext` (Playwright's HTTP client, like Java `HttpClient` / RestAssured). It uses the `api` project's `baseURL`.
- Knows **paths and parameters**, **returns the response**, **never asserts**. The test decides what "correct" is → negative tests are possible.
- Paths from `routes.automationexercise.api.*`, never typed in.

```ts
export class ProductClient {
  constructor(private readonly request: APIRequestContext) {}

  async getProductList(): Promise<APIResponse> {
    return this.request.get(api.productsListPath);
  }
}
```

## Sending data
| Option | Sends | Use here |
| --- | --- | --- |
| `form: { search_product: 'top' }` | form fields (`search_product=top`) | ✅ this site's POSTs |
| `data: { … }` | JSON body | not this site |
| `params: { q: 'x' }` | query string (`?q=x`), encoded for you | GET filters |
| nothing | no body | wrong-method test (`POST /productsList` → 405) |

## Optional parameter: `term?: string`
`?` = may be left out. `searchProduct()` sends no term → the 400 case. Java: an overload without the argument.

## The API fixture (`src/fixtures/api.fixtures.ts`)

| | Built-in `request` (simple) | Our own context (scales) |
| --- | --- | --- |
| Code | `productClient: async ({ request }, use) => use(new ProductClient(request))` | `request.newContext({ baseURL })` → `use` → `dispose()` |
| `baseURL` | the project's (one) | per service, from `env` |
| Closing | Playwright does it | **we** do: opened it → close it (`dispose()`, like Java `client.close()`) |
| When | one service, small project | many services/hosts, different headers per service |

- `APIRequestContext` = a configured HTTP client (Java `HttpClient` / RestAssured spec), not a line that stays open.
- `scope: 'worker'` = created once per worker and shared: fine because it holds **no test state**. Anything with a user's cookies/token → per test.
- A worker fixture can only use other worker fixtures.
- curl = for you (manual check). The client = for tests (objects, assertions, config, CI).

## ⚠️ Typos in route keys are NOT caught by `tsc`
`routes` is checked with `z.record(...)` = "any key", so `api.searchProduct` (missing `Path`) compiles and is `undefined` at runtime. Watch key names. (A stricter schema per app could catch it; not worth it yet.)
