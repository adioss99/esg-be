import { z } from 'zod';

export const registerSchema = (body: any) =>
  z
    .object({
      name: z.string().min(3, 'Name must be at least 3 characters long'),
      email: z.string().email('Invalid email'),
      password: z.string().min(6, 'Password must be at least 6 characters long').max(100, 'Password too long'),
      role: z.enum(['QC', 'ADMIN', 'PACKING']),
    })
    .safeParse(body);
export type registerType = z.infer<typeof registerSchema>;

export const loginValidationSchema = (body: any) =>
  z
    .object({
      email: z.string().email(),
      password: z.string(),
    })
    .safeParse(body);
export type loginType = z.infer<typeof loginValidationSchema>;

export const updateUserSchema = (body: any) =>
  z
    .object({
      name: z.string().min(3, 'Name must be at least 3 characters long'),
      email: z.string().email('Invalid email'),
      role: z.enum(['QC', 'ADMIN', 'OPERATOR']),
    })
    .safeParse(body);
export type updateUserType = z.infer<typeof updateUserSchema>;
