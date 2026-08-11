import type { AuthState, Profile } from '@nivelate/shared';
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Store de sesión. Se hidrata una vez al montar la app (`hydrate()`)
 * y se mantiene actualizado con el listener de Supabase (`subscribe()`).
 *
 * Componentes leen con selectors — nunca `useAuthStore()` a pelo, siempre
 * `useAuthStore((s) => s.state.status)` para minimizar re-renders.
 */
type Store = {
  /** Estado de sesión derivado. */
  state: AuthState;
  /** Refresh manual del profile (después de completar onboarding, por ejemplo). */
  refreshProfile: () => Promise<void>;
  /** Hidratación inicial. Llamar una sola vez desde el root layout. */
  hydrate: () => Promise<void>;
  /** Subscribe al listener de Supabase. Devuelve unsubscribe. */
  subscribe: () => () => void;
};

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // No queremos que un error de perfil rompa la sesión — el usuario simplemente
    // aparece como "sin onboarding" y el flow lo manda a /welcome.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] no se pudo cargar el profile:', error.message);
    }
    return null;
  }
  return data;
}

function toAuthenticated(user: User, _session: Session, profile: Profile | null): AuthState {
  return {
    status: 'authenticated',
    userId: user.id,
    email: user.email ?? '',
    emailConfirmedAt: user.email_confirmed_at ?? null,
    profile,
  };
}

export const useAuthStore = create<Store>((set, get) => ({
  state: { status: 'loading' },

  refreshProfile: async () => {
    const current = get().state;
    if (current.status !== 'authenticated') return;
    const profile = await fetchProfile(current.userId);
    set({ state: { ...current, profile } });
  },

  hydrate: async () => {
    if (!supabase) {
      set({ state: { status: 'anonymous' } });
      return;
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      set({ state: { status: 'anonymous' } });
      return;
    }

    const profile = await fetchProfile(data.session.user.id);
    set({ state: toAuthenticated(data.session.user, data.session, profile) });
  },

  subscribe: () => {
    if (!supabase) return () => undefined;

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        set({ state: { status: 'anonymous' } });
        return;
      }

      // En SIGNED_IN y USER_UPDATED recargamos el profile por si el trigger recién lo creó
      // o si el usuario se acaba de verificar el email.
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const profile = await fetchProfile(session.user.id);
        set({ state: toAuthenticated(session.user, session, profile) });
        return;
      }

      // PASSWORD_RECOVERY / SIGNED_OUT no cae acá (SIGNED_OUT ya fue manejado arriba).
      // Otros eventos: preservamos el profile actual si ya lo teníamos.
      const current = get().state;
      const preservedProfile = current.status === 'authenticated' ? current.profile : null;
      set({ state: toAuthenticated(session.user, session, preservedProfile) });
    });

    return () => data.subscription.unsubscribe();
  },
}));

/** Selector: ¿el store terminó de hidratar? */
export const selectIsReady = (s: Store) => s.state.status !== 'loading';

/** Selector: user id si hay sesión, null si no. */
export const selectUserId = (s: Store): string | null =>
  s.state.status === 'authenticated' ? s.state.userId : null;
