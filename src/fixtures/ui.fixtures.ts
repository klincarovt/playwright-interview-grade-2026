import { test as base } from '@playwright/test';
import { LoginPage } from '../ui/pages/LoginPage';
import { HeaderComponent } from '../ui/components/HeaderComponent';

// Ad + consent-popup domains seen on automationexercise.com (docs/me/Site Notes.md).
// A regex: matches any request URL that CONTAINS one of these words ('|' = or).
// Ads cover buttons and slow pages down → flaky tests. Add a domain here if a new one shows up.
const AD_HOSTS = /googlesyndication|adtrafficquality|fundingchoicesmessages|doubleclick/;

export const test = base.extend<{ loginPage: LoginPage;  header: HeaderComponent }>({
    // Overrides Playwright's built-in `context`, so EVERY page a test opens gets ad blocking.
    context: async ({ context }, use) => {
        // Intercept every browser request whose URL matches AD_HOSTS and cancel it (abort):
        // it never reaches the network, so the ad never loads. All other requests pass untouched.
        await context.route(AD_HOSTS, async (route) => {
            await route.abort();
        });
        // The test runs here and receives the context with blocking switched on.
        await use(context);
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    header: async ({ page }, use) => {
        await use(new HeaderComponent(page));
    },

});
