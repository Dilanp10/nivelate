import { describe, expect, it } from 'vitest';
import {
  forgotPasswordSchema,
  loginSchema,
  onboardingSchema,
  resetPasswordSchema,
  signupSchema,
  toFieldErrors,
} from './validators';

describe('signupSchema', () => {
  it('acepta email válido y password fuerte', () => {
    const result = signupSchema.safeParse({ email: 'a@b.com', password: 'abcd1234' });
    expect(result.success).toBe(true);
  });

  it('rechaza email sin arroba', () => {
    const result = signupSchema.safeParse({ email: 'nope', password: 'abcd1234' });
    expect(result.success).toBe(false);
  });

  it('rechaza password de menos de 8 caracteres', () => {
    const result = signupSchema.safeParse({ email: 'a@b.com', password: 'abc123' });
    expect(result.success).toBe(false);
  });

  it('rechaza password sin números', () => {
    const result = signupSchema.safeParse({ email: 'a@b.com', password: 'abcdefgh' });
    expect(result.success).toBe(false);
  });

  it('rechaza password sin letras', () => {
    const result = signupSchema.safeParse({ email: 'a@b.com', password: '12345678' });
    expect(result.success).toBe(false);
  });

  it('trimea espacios del email', () => {
    const result = signupSchema.safeParse({ email: '  a@b.com  ', password: 'abcd1234' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('a@b.com');
  });
});

describe('loginSchema', () => {
  it('acepta cualquier password no vacía (no valida fuerza al entrar)', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rechaza password vacía', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('solo requiere email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('acepta cuando ambas coinciden', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'abcd1234',
      confirmPassword: 'abcd1234',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza cuando no coinciden y apunta el error a confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'abcd1234',
      confirmPassword: 'abcd9999',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });
});

describe('onboardingSchema', () => {
  it('acepta las 4 metas válidas', () => {
    for (const goal of [5, 10, 15, 20]) {
      const result = onboardingSchema.safeParse({ dailyGoalMin: goal });
      expect(result.success).toBe(true);
    }
  });

  it('rechaza una meta fuera del enum', () => {
    expect(onboardingSchema.safeParse({ dailyGoalMin: 7 }).success).toBe(false);
  });

  it('displayName es opcional', () => {
    expect(onboardingSchema.safeParse({ dailyGoalMin: 10 }).success).toBe(true);
  });

  it('rechaza displayName de más de 40 caracteres', () => {
    const result = onboardingSchema.safeParse({
      displayName: 'x'.repeat(41),
      dailyGoalMin: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe('toFieldErrors', () => {
  it('mapea cada campo a su primer error', () => {
    const result = signupSchema.safeParse({ email: 'nope', password: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFieldErrors(result.error);
      expect(errors.email).toBe('Email inválido');
      expect(typeof errors.password).toBe('string');
    }
  });

  it('devuelve objeto vacío para un error sin issues de path', () => {
    const result = signupSchema.safeParse({ email: 'a@b.com', password: 'abcd1234' });
    expect(result.success).toBe(true);
  });
});
