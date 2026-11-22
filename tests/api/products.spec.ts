import { apiTest as test, expect } from "../../src/fixtures";
import { ProductsListResponseSchema, ErrorResponseSchema } from "../../src/api/models/products.schema";


test.describe('Products API', { tag: ['@api', '@products'] }, () => {
    test('GET products list returns products', { tag: '@smoke' }, async ({ productClient }) => {
        const response = await productClient.getProductsList();
        const body = ProductsListResponseSchema.parse(await response.json());   // contract check

        expect(body.responseCode).toBe(200);
        expect(body.products.length).toBeGreaterThan(0);
    });

    test('POST products list is not supported', async ({ productClient }) => {
        const response = await productClient.postProductsList();
        const body = ErrorResponseSchema.parse(await response.json());

        expect(body.responseCode).toBe(405);
    });
});