import { z } from 'zod';
import { UserProfileSchema } from './user.schema';

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1, "Name is required"),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// Response schemas
export const RegisterResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
});

export const LogoutResponseSchema = z.object({
  ok: z.boolean(),
});

export const ProfileResponseSchema = UserProfileSchema;

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
