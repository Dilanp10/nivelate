import type { AuthState } from './types';

export const ROUTES = {
  login: '/login',
  verifyEmail: '/verify-email',
  onboarding: '/welcome',
  home: '/',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Dada la sesión, devuelve dónde debería estar el usuario.
 * `null` significa "todavía no sabemos" (esperar a que hidrate).
 *
 * Los _layout.tsx de cada route group consultan esta función.
 */
export function computeDestination(state: AuthState): Route | null {
  if (state.status === 'loading') return null;
  if (state.status === 'anonymous') return ROUTES.login;
  if (!state.emailConfirmedAt) return ROUTES.verifyEmail;
  if (!state.profile?.onboarded_at) return ROUTES.onboarding;
  return ROUTES.home;
}

/** ¿El usuario puede acceder a las rutas protegidas? */
export function canAccessProtected(state: AuthState): boolean {
  return computeDestination(state) === ROUTES.home;
}

/** ¿El usuario debería ver las pantallas de auth (login/signup/etc)? */
export function shouldSeeAuthScreens(state: AuthState): boolean {
  return state.status === 'anonymous';
}
