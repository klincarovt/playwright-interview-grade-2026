import type { APIRequestContext, APIResponse } from '@playwright/test';
import { routes } from '../../config/environments';

const api = routes.automationexercise.api;

export class ProductClient {

    constructor(private readonly request: APIRequestContext) { }

    async getProductsList(): Promise<APIResponse> {
        return await this.request.get(api.productsListPath);
    }

    async postProductsList(): Promise<APIResponse> {
        return await this.request.post(
            api.productsListPath
        );
    }

    async searchProduct(term?: string): Promise<APIResponse> {
        return await this.request.post(api.searchProductPath,
            {
                form: term === undefined ? undefined : { search_product: term }
            }
        );
    }

}