import { routes } from '../../config/environments';
import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';  

export class LoginPage {
    readonly page: Page;
    readonly header: HeaderComponent;

    readonly emailAddressInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly loginErrorText: Locator;


    readonly signUpNameInput: Locator;
    readonly signUpEmailAddressInput: Locator;
    readonly signUpButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = new HeaderComponent(page);

        this.emailAddressInput = page.getByTestId('login-email');
        this.passwordInput = page.getByTestId('login-password');
        this.loginButton = page.getByTestId('login-button');
        this.loginErrorText = page.getByText('Your email or password is incorrect!');

        this.signUpNameInput = page.getByTestId('signup-name');
        this.signUpEmailAddressInput = page.getByTestId('signup-email');
        this.signUpButton = page.getByTestId('signup-button');
    }

    async goto(): Promise<void> {
        await this.page.goto(routes.automationexercise.web.loginPath);
    }

    async login(emailAddress: string, password: string): Promise<void> {
        await this.emailAddressInput.fill(emailAddress);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async signUp(name: string, emailAddress: string): Promise<void> {
        await this.signUpNameInput.fill(name);
        await this.signUpEmailAddressInput.fill(emailAddress);
        await this.signUpButton.click();
    }
} 