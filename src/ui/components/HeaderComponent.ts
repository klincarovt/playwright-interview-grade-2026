import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
    readonly root: Locator;

    readonly homeNav: Locator;
    readonly productsNav: Locator;
    readonly cartNav: Locator;
    readonly signUpLoginNav: Locator;

    readonly logoutNav: Locator;
    readonly deleteAccountNav: Locator;
    readonly loggedInAs: Locator;

    readonly testCasesNav: Locator;
    readonly apiTestingNav: Locator;
    readonly contactUsNav: Locator;

    constructor(page: Page) {
        this.root = page.getByRole('banner');

        this.homeNav = this.root.getByRole('link', { name: 'Home' });
        this.productsNav = this.root.getByRole('link', { name: 'Products' });
        this.cartNav = this.root.getByRole('link', { name: 'Cart' });
        this.signUpLoginNav = this.root.getByRole('link', { name: 'Signup / Login' });

        this.logoutNav = this.root.getByRole('link', { name: 'Logout' });
        this.deleteAccountNav = this.root.getByRole('link', { name: 'Delete Account' });
        this.loggedInAs = this.root.getByText('Logged in as');

        this.testCasesNav = this.root.getByRole('link', { name: 'Test Cases' });
        this.apiTestingNav = this.root.getByRole('link', { name: 'API Testing' });
        this.contactUsNav = this.root.getByRole('link', { name: 'Contact us' });

    }

    async toHome(): Promise<void> {
        await this.homeNav.click();
    }

    async toProducts(): Promise<void> {
        await this.productsNav.click();
    }

    async toCart(): Promise<void> {
        await this.cartNav.click();
    }

    async toSignUpOrLogin(): Promise<void> {
        await this.signUpLoginNav.click();
    }

    async logout(): Promise<void> {
        await this.logoutNav.click()
    }

    async deleteAccount(): Promise<void> {
        await this.deleteAccountNav.click();
    }
}

