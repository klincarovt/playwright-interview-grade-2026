import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    price: z.string(),                 // "Rs. 500": text on this site, not a number
    brand: z.string(),
    category: z.object({
        usertype: z.object({ usertype: z.string() }),
        category: z.string(),
    }),
});

export const ProductsListResponseSchema = z.object({
    responseCode: z.number(),
    products: z.array(ProductSchema)
});



export type Product = z.infer<typeof ProductSchema>;