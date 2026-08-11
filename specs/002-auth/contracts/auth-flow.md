# Contract — Auth Flow

Documentación de los flujos de auth con Supabase JS SDK. No es una API propia — usamos directamente `supabase.auth.*`. Este doc sirve para alinear los mensajes de error, tipos y comportamiento esperado.

## Endpoints (SDK calls)

### `signUp(email, password) → { user, session } | Error`

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: getRedirectUrl('/verify-email/callback'),
  },
});
```

**Success:**
- `data.user.email_confirmed_at === null` → email de verificación enviado.
- `data.session === null` hasta que el user confirme.

**Errores comunes:**
| Mensaje EN | Traducción ES |
|-----------|---------------|
| `User already registered` | Ya existe una cuenta con este email |
| `Password should be at least 6 characters` | La contraseña debe tener al menos 8 caracteres |
| `Signup requires a valid password` | Ingresá una contraseña |
| `Unable to validate email address: invalid format` | Email inválido |

### `signInWithPassword(email, password) → { user, session } | Error`

```ts
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

**Errores:**
| Mensaje EN | Traducción ES |
|-----------|---------------|
| `Invalid login credentials` | Email o contraseña incorrectos |
| `Email not confirmed` | Confirmá tu email antes de entrar |
| `Too many requests` | Muchos intentos. Esperá un minuto. |

### `signInWithOtp(email) → { session: null }`

```ts
const { data, error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    shouldCreateUser: true,
    emailRedirectTo: getRedirectUrl('/auth/callback'),
  },
});
```

**Comportamiento:** siempre devuelve `session: null` inmediatamente. Envia el link por mail. La sesión se establece cuando el usuario clickea el link y aterriza en la app.

**No revelar** si el email existe o no — mostrar siempre "Te enviamos un link si el email está registrado".

### `resetPasswordForEmail(email)`

```ts
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: getRedirectUrl('/auth/reset-password'),
});
```

**Success:** mail enviado con link a `redirectTo` + tokens.
**Errores:** en general no fallan aunque el email no exista (por seguridad).

### `updateUser({ password }) — usado en reset-password`

```ts
const { error } = await supabase.auth.updateUser({ password: newPassword });
```

Requiere sesión activa. En el flow de reset, la sesión se establece automáticamente al aterrizar en la app desde el link de reset.

### `signOut()`

```ts
const { error } = await supabase.auth.signOut();
```

Limpia storage local + revoca refresh token en el server.

### `onAuthStateChange(callback)`

```ts
const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
  // event: SIGNED_IN | SIGNED_OUT | USER_UPDATED | PASSWORD_RECOVERY | TOKEN_REFRESHED
  useAuthStore.setState({ session, user: session?.user ?? null });
});
```

## Helper — construir redirect URLs

```ts
// apps/mobile/src/lib/auth-redirect.ts
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export function getRedirectUrl(path: string): string {
  if (Platform.OS === 'web') {
    return `${window.location.origin}${path}`;
  }
  return Linking.createURL(path); // nivelate://<path>
}
```

## Estados de sesión (Zustand)

```ts
// apps/mobile/src/stores/auth.ts
type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: User; session: Session; profile: Profile | null };

// derivados:
// isOnboarded = state.status === 'authenticated' && state.profile?.onboarded_at !== null
// isEmailVerified = state.status === 'authenticated' && state.user.email_confirmed_at !== null
```

## Reglas de redirección centralizadas

Función pura que dado el estado devuelve dónde debería estar el usuario:

```ts
// packages/shared/src/auth/redirect-rules.ts
export function computeRedirect(state: AuthState): string | null {
  if (state.status === 'loading') return null; // esperar

  if (state.status === 'anonymous') {
    return '/(auth)/login'; // solo si intenta acceder a protected
  }

  if (!state.user.email_confirmed_at) return '/(auth)/verify-email';
  if (!state.profile?.onboarded_at) return '/(onboarding)/welcome';
  return '/(protected)/'; // ok
}
```

Los `_layout.tsx` de cada grupo consultan esta función.
