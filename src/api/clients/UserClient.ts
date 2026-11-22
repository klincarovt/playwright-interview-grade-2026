import type { APIRequestContext, APIResponse } from '@playwright/test';
import { routes } from '../../config/environments';
import { User } from '../../types/user';

const api = routes.automationexercise.api;

export class UserClient {

    constructor(private readonly request: APIRequestContext) { }

    async createAccount(user: User): Promise<APIResponse> {
        return await this.request.post(api.createAccountPath,
            {
                form: user 
            }
        );
    }

    async deleteAccount(email: string, password: string): Promise<APIResponse> {
        return await this.request.delete(
            api.deleteAccountPath,
            {
                form: {
                    email,
                    password
                }
            }
        );
    }

}