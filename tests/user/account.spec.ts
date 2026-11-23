import { test, expect } from '../../src/fixtures';
import { routes } from '../../src/config/environments';

test.describe('Logged-in user', { tag: ['@regression', '@auth'] }, () => {
    test('starts logged in from the saved session', { tag: '@smoke' }, async ({ page, header }) => {
        await page.goto(routes.automationexercise.web.homePath);   // no login step at all

        await expect(header.loggedInAs).toBeVisible();
    });
});