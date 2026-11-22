import { expect, test } from '../../src/fixtures/index';

test.describe('Login Spec', { tag: ['@regression', '@auth'] }, () => {
    test('login with wrong password shows an error',
        async ({ loginPage }) => {
            await loginPage.goto();
            await loginPage.login(`nobody-${crypto.randomUUID()}@example.com`, 'wrong-password');

            await expect(loginPage.loginErrorText).toBeVisible()
        });

    test('login with a valid user shows "Logged in as"', { tag: '@smoke' }, async ({ loginPage, user }) => {
        await loginPage.goto();
        await loginPage.login(user.email, user.password);

        await expect(loginPage.header.loggedInAs).toContainText(user.name);
    });

});