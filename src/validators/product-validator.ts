import { z } from 'zod';

export const productSchema = (body: any) =>
  z
    .object({
      modelName: z.string().min(3, 'Name must be at least 3 characters long'),
      quantity: z.coerce.number(),
    })
    .safeParse(body);
export type productSchemaType = z.infer<typeof productSchema>;

export const productStatusSchema = (body: any) =>
  z
    .object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    })
    .safeParse(body);
export type productStatusSchemaType = z.infer<typeof productStatusSchema>;
