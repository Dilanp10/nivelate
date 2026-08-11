import { describe, expect, it } from 'vitest';
import { toSpanishAuthError } from './error-messages';

describe('toSpanishAuthError', () => {
  it('devuelve string vacío para null o undefined', () => {
    expect(toSpanishAuthError(null)).toBe('');
    expect(toSpanishAuthError(undefined)).toBe('');
  });

  it('traduce credenciales inválidas sin filtrar cuál campo falló', () => {
    expect(toSpanishAuthError({ message: 'Invalid login credentials' })).toBe(
      'Email o contraseña incorrectos',
    );
  });

  it('traduce email no confirmado', () => {
    expect(toSpanishAuthError({ message: 'Email not confirmed' })).toBe(
      'Confirmá tu email antes de entrar',
    );
  });

  it('traduce usuario ya registrado', () => {
    expect(toSpanishAuthError({ message: 'User already registered' })).toBe(
      'Ya existe una cuenta con este email',
    );
  });

  it('detecta rate limiting por patrón, no por match exacto', () => {
    const rateLimitMsg = 'Demasiados intentos. Esperá un minuto y volvé a probar.';
    expect(toSpanishAuthError({ message: 'Email rate limit exceeded' })).toBe(rateLimitMsg);
    expect(
      toSpanishAuthError({
        message: 'For security purposes, you can only request this after 47 seconds',
      }),
    ).toBe(rateLimitMsg);
    expect(toSpanishAuthError({ message: 'Too many requests' })).toBe(rateLimitMsg);
  });

  it('cae al mensaje genérico para errores desconocidos', () => {
    expect(toSpanishAuthError({ message: 'Some unmapped backend error' })).toBe(
      'Ocurrió un error. Intentá de nuevo.',
    );
  });

  it('nunca devuelve el mensaje original en inglés', () => {
    const original = 'Database connection pool exhausted';
    expect(toSpanishAuthError({ message: original })).not.toContain(original);
  });
});
