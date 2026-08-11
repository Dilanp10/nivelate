import { z } from 'zod';
import { DAILY_GOAL_OPTIONS } from './types';

const email = z.string().trim().min(1, 'Ingresá tu email').email('Email inválido');

// Password: mínimo 8 chars, al menos una letra y un número.
const strongPassword = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-zA-Z]/, 'La contraseña debe incluir al menos una letra')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número');

export const signupSchema = z.object({
  email,
  password: strongPassword,
});
export type SignupForm = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Ingresá tu contraseña'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const magicLinkSchema = z.object({ email });
export type MagicLinkForm = z.infer<typeof magicLinkSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Repetí la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(40, 'El nombre no puede tener más de 40 caracteres')
    .optional(),
  dailyGoalMin: z.union([
    z.literal(DAILY_GOAL_OPTIONS[0]),
    z.literal(DAILY_GOAL_OPTIONS[1]),
    z.literal(DAILY_GOAL_OPTIONS[2]),
    z.literal(DAILY_GOAL_OPTIONS[3]),
  ]),
});
export type OnboardingForm = z.infer<typeof onboardingSchema>;

/** Convierte un ZodError en un mapa campo → primer mensaje de error. */
export function toFieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && result[key] === undefined) {
      result[key] = issue.message;
    }
  }
  return result;
}
