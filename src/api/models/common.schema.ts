import { z } from 'zod';

// Moved from products.schema.ts
// Simple answers on this site: { responseCode, message } (errors AND "User created!").
// All error responses on this site: { responseCode, message }
export const MessageResponseSchema = z.object({
    responseCode: z.number(),
    message: z.string()
});