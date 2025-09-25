import { z } from 'zod';
import { ID, Role, TimestampFields } from './common';

export const CreateUserSchema = z
  .object({
    email: z.email('Valid email required'),
    name: z.string().min(1).optional(),
    passwordHash: z.string().optional(),
    provider: z.string().optional(),
    providerId: z.string().optional(),
    role: Role.default('MEMBER'),
  })
  .strict();

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserSchema = CreateUserSchema.extend({
  id: ID,
  ...TimestampFields,
}).strict();

export const PublicUserSchema = UserSchema.omit({
  passwordHash: true,
}).strict();

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
