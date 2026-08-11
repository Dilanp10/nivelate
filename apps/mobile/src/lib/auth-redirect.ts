import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/**
 * Construye una URL absoluta que Supabase puede usar como `emailRedirectTo` o
 * `redirectTo`. En web usa el origin actual, en native usa el scheme `nivelate://`.
 *
 * Ejemplos:
 *   getRedirectUrl('/callback')             → 'http://localhost:8081/callback' (web)
 *                                           → 'nivelate://callback'           (native)
 *   getRedirectUrl('/auth/reset-password')  → similar con el path completo.
 *
 * IMPORTANTE: la URL resultante debe estar en la lista de "Additional Redirect URLs"
 * del dashboard de Supabase, si no el link del email queda inválido.
 */
export function getRedirectUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (Platform.OS === 'web') {
    // window.location está disponible en web.
    if (typeof window === 'undefined') return normalized;
    return `${window.location.origin}${normalized}`;
  }

  // Linking.createURL respeta el scheme definido en app.json (`nivelate`).
  return Linking.createURL(normalized);
}
