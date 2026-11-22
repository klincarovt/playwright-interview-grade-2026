# Site Notes (automationexercise.com)

What we found on the real site. These go into the final README's "Issues found".

| Finding | How we found it | Impact |
| --- | --- | --- |
| `/products` makes **no `/api/*` calls**: server-rendered | Playwright MCP, network requests (S1) | Nothing to mock there with `page.route` (plan §14). Add to cart still to check |
| Ad/consent domains: `pagead2.googlesyndication.com`, `fundingchoicesmessages.google.com` (consent popup), `ep1.adtrafficquality.google` | Playwright MCP, network requests (S1) | Block them in the S3 ad-blocking fixture |
| Google Fonts loaded over `http://` → 3 mixed-content console errors | Playwright MCP, console (S1) | Site quirk, not our bug |
| Header = `banner` role. Logged out: Home, Products, Cart, Signup / Login, Test Cases, API Testing, Video Tutorials, Contact us. Logged in adds **Logout**, **Delete Account**, **"Logged in as …"** | Playwright MCP snapshot + manual login (S3) | `HeaderComponent` scopes to `getByRole('banner')` |
| Link names start with an icon glyph (`" Home"`) | Playwright MCP snapshot (S3) | Default (partial) `name` match works, `exact: true` fails |
| Login page has **two** "Email Address" fields (login + signup) | Playwright MCP snapshot (S3) | Use `data-qa` (`login-email`, `signup-email`) |
| Login error "Your email or password is incorrect!" has **no `data-qa`** | Manual check (S3) | `getByText`. Ask devs for test ids on error states |

## API (verified with curl, S5)

| Call | HTTP status | Body `responseCode` | Message |
| --- | --- | --- | --- |
| `POST /api/productsList` (wrong method) | **200** | 405 | "This request method is not supported." |
| `POST /api/searchProduct` (no parameter) | **200** | 400 | "Bad request, search_product parameter is missing in POST request." |

`GET /api/productsList` (Playwright MCP, S5): `{ responseCode: 200, products: [{ id: 1, name: "Blue Top", price: "Rs. 500", brand: "Polo", category: { usertype: { usertype: "Women" }, category: "Tops" } }, …] }`. **`price` is a string with a currency prefix (`"Rs. 500"`), not a number** → schema `z.string()`; parse it if a test needs to compare prices.

→ **HTTP status is always 200, the real code is in the body.** Tests assert `body.responseCode`, never `response.ok()` / status 200 (they can't fail here). README "Issues found": a contract defect.

Still to verify: form-encoded POST bodies.
