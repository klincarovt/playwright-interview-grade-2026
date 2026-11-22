import { expect, test } from '../../src/fixtures/index';

test.describe('Login Spec', { tag: ['@regression', '@auth'] }, () => {
    test('login with wrong password shows an error',
          async ({ loginPage }) => {
            await loginPage.goto();
            await loginPage.login(`nobody-${crypto.randomUUID()}@example.com`, 'wrong-password');
            
            await expect(loginPage.loginErrorText).toBeVisible()
    });

});