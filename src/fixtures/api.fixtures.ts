/**
 * API FIXTURES: give API tests a ready-made client per resource, no browser involved.
 *
 *   apiTest('...', async ({ productClient }) => { await productClient.getProductsList(); });
 *
 * Layers: the CLIENT knows how to call an endpoint · this FIXTURE builds the client · the TEST calls + asserts.
 * Notes: docs/me/API Layer.md → "The API fixture".
 */
import { test as base, request, type APIRequestContext } from '@playwright/test';
import { env } from '../config/environments';
import { ProductClient } from '../api/clients/ProductClient';

import { UserClient } from '../api/clients/UserClient';
import { MessageResponseSchema } from '../api/models/common.schema';
import { buildUser } from '../data/builders/user.builder';
import type { User } from '../types/user';

// PER-TEST fixtures: fresh for every test.
type ApiTestFixtures = {
    user: User;          // a brand-new account, deleted after the test
};

// The fixtures this file adds and their types (like a small Java interface).
// They are WORKER fixtures: created once per worker (parallel process), shared by its tests.
type ApiWorkerFixtures = {
    apiContext: APIRequestContext;
    productClient: ProductClient;
    userClient: UserClient;
}

// extend<per-test fixtures, per-worker fixtures>: we only have per-worker ones.
export const apiTest = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
    // One HTTP client per SERVICE, with that service's baseURL from config/environments/<ENV>.json.
    // A second service would get a second context like this one, with its own baseURL.
    // Small-project alternative: use Playwright's built-in `request` (one baseURL, closed for you).
    apiContext: [async ({ }, use) => {
        const context = await request.newContext({ baseURL: env.automationexercise.api.baseURL });
        await use(context);      // the worker's tests run here
        await context.dispose(); // we opened it, so we close it (like Java client.close())

    }, { scope: 'worker' }],     // shared per worker: safe because it holds no test state (no login, no cookies)

    productClient: [async ({ apiContext }, use) => {
        await use(new ProductClient(apiContext));
    }, { scope: 'worker' }],

    userClient: [async ({ apiContext }, use) => {
        await use(new UserClient(apiContext));
    }, { scope: 'worker' }],

    user: async ({ userClient }, use) => {
        const user = buildUser();
        const created = MessageResponseSchema.parse(await (await userClient.createAccount(user)).json());
        if (created.responseCode !== 201) throw new Error(`createAccount failed: ${created.message}`); // setup guard

        await use(user);

        await userClient.deleteAccount(user.email, user.password);
    },

});