import fs from 'fs';
import { test as setup, expect } from '../../src/fixtures';
import { AUTH_DIR, USER_STATE, ACCOUNT_FILE } from '../../src/config/paths';
import { buildUser } from '../../src/data/builders/user.builder';
import { MessageResponseSchema } from '../../src/api/models/common.schema';

setup('create an account and save the logged-in session', async ({ userClient, loginPage, page }) => {
    const user = buildUser();
    const created = MessageResponseSchema.parse(await (await userClient.createAccount(user)).json());
    expect(created.responseCode).toBe(201);

    // Remember the account first, so teardown can delete it even if the login below fails.
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    fs.writeFileSync(ACCOUNT_FILE, JSON.stringify({ email: user.email, password: user.password }));

    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await expect(loginPage.header.loggedInAs).toBeVisible();

    await page.context().storageState({ path: USER_STATE });   // save cookies → user.json
});