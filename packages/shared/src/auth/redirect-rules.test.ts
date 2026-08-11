import { describe, expect, it } from 'vitest';
import {
  ROUTES,
  canAccessProtected,
  computeDestination,
  shouldSeeAuthScreens,
} from './redirect-rules';
import type { AuthState } from './types';

const profile = (onboardedAt: string | null) => ({
  user_id: 'u1',
  display_name: 'Dilan',
  daily_goal_min: 10,
  onboarded_at: onboardedAt,
  created_at: '2026-08-11T00:00:00Z',
  updated_at: '2026-08-11T00:00:00Z',
});

const authenticated = (over: Partial<Extract<AuthState, { status: 'authenticated' }>> = {}) =>
  ({
    status: 'authenticated',
    userId: 'u1',
    email: 'a@b.com',
    emailConfirmedAt: '2026-08-11T00:00:00Z',
    profile: profile('2026-08-11T00:00:00Z'),
    ...over,
  }) satisfies AuthState;

describe('computeDestination', () => {
  it('devuelve null mientras carga (no redirigir todavía)', () => {
    expect(computeDestination({ status: 'loading' })).toBeNull();
  });

  it('manda a login si es anónimo', () => {
    expect(computeDestination({ status: 'anonymous' })).toBe(ROUTES.login);
  });

  it('manda a verify-email si el email no está confirmado', () => {
    expect(computeDestination(authenticated({ emailConfirmedAt: null }))).toBe(ROUTES.verifyEmail);
  });

  it('manda a onboarding si confirmó email pero no completó onboarding', () => {
    expect(computeDestination(authenticated({ profile: profile(null) }))).toBe(ROUTES.onboarding);
  });

  it('manda a onboarding si todavía no existe la fila de profile', () => {
    expect(computeDestination(authenticated({ profile: null }))).toBe(ROUTES.onboarding);
  });

  it('manda a home cuando todo está completo', () => {
    expect(computeDestination(authenticated())).toBe(ROUTES.home);
  });

  it('prioriza verify-email sobre onboarding', () => {
    const state = authenticated({ emailConfirmedAt: null, profile: profile(null) });
    expect(computeDestination(state)).toBe(ROUTES.verifyEmail);
  });
});

describe('canAccessProtected', () => {
  it('solo es true con sesión + email confirmado + onboarding completo', () => {
    expect(canAccessProtected(authenticated())).toBe(true);
    expect(canAccessProtected({ status: 'anonymous' })).toBe(false);
    expect(canAccessProtected({ status: 'loading' })).toBe(false);
    expect(canAccessProtected(authenticated({ emailConfirmedAt: null }))).toBe(false);
    expect(canAccessProtected(authenticated({ profile: profile(null) }))).toBe(false);
  });
});

describe('shouldSeeAuthScreens', () => {
  it('solo los anónimos ven login/signup', () => {
    expect(shouldSeeAuthScreens({ status: 'anonymous' })).toBe(true);
    expect(shouldSeeAuthScreens({ status: 'loading' })).toBe(false);
    expect(shouldSeeAuthScreens(authenticated())).toBe(false);
  });
});
