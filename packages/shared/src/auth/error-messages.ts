/**
 * Supabase devuelve errores en inglés. Los mapeamos a español para la UI.
 * Ver spec 002 contracts/auth-flow.md.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'Confirmá tu email antes de entrar',
  'User already registered': 'Ya existe una cuenta con este email',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
  'Signup requires a valid password': 'Ingresá una contraseña',
  'Unable to validate email address: invalid format': 'Email inválido',
  'New password should be different from the old password':
    'La nueva contraseña debe ser distinta a la anterior',
  'Email link is invalid or has expired': 'El link expiró o no es válido. Pedí uno nuevo.',
  'Token has expired or is invalid': 'El link expiró o no es válido. Pedí uno nuevo.',
  'User not found': 'No encontramos una cuenta con ese email',
  'Auth session missing!': 'Tu sesión expiró. Volvé a entrar.',
};

const GENERIC_ERROR = 'Ocurrió un error. Intentá de nuevo.';
const RATE_LIMIT_ERROR = 'Demasiados intentos. Esperá un minuto y volvé a probar.';

export function toSpanishAuthError(error: { message: string } | null | undefined): string {
  if (!error) return '';

  const mapped = AUTH_ERROR_MESSAGES[error.message];
  if (mapped) return mapped;

  // Rate limiting llega con mensajes variables ("For security purposes, you can only
  // request this after N seconds", "Email rate limit exceeded", etc.)
  if (/rate limit|too many requests|for security purposes/i.test(error.message)) {
    return RATE_LIMIT_ERROR;
  }

  return GENERIC_ERROR;
}
