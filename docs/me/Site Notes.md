# Site Notes (automationexercise.com)

What we found on the real site. These go into the final README's "Issues found".

| Finding | How we found it | Impact |
| --- | --- | --- |
| `/products` makes **no `/api/*` calls**: server-rendered | Playwright MCP, network requests (S1) | Nothing to mock there with `page.route` (plan §14). Add to cart still to check |
| Ad/consent domains: `pagead2.googlesyndication.com`, `fundingchoicesmessages.google.com` (consent popup), `ep1.adtrafficquality.google` | Playwright MCP, network requests (S1) | Block them in the S3 ad-blocking fixture |
| Google Fonts loaded over `http://` → 3 mixed-content console errors | Playwright MCP, console (S1) | Site quirk, not our bug |

Still to verify (plan §5): the API response codes, HTTP 200 on errors, form-encoded POST bodies.
