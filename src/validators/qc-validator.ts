import { z } from 'zod';

export const qcSchema = (body: any) =>
  z
    .object({
      passed: z.boolean(),
      notes: z.string().nullable(),
    })
    .safeParse(body);
