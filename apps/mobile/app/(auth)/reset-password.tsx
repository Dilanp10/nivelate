import { type ResetPasswordForm, resetPasswordSchema, toFieldErrors } from '@nivelate/shared';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useResetPassword } from '../../src/hooks/useResetPassword';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

/**
 * A esta pantalla se llega desde el link del email de reset. Supabase captura
 * los tokens del hash automáticamente (detectSessionInUrl: true en el cliente)
 * y crea una sesión temporal PASSWORD_RECOVERY. Con esa sesión hacemos
 * updateUser({ password: nueva }).
 */
export default function ResetPassword() {
  const [form, setForm] = useState<ResetPasswordForm>({ password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordForm, string>>>(
    {},
  );
  const reset = useResetPassword();
  const status = useAuthStore((s) => s.state.status);

  const submitError = reset.error instanceof Error ? reset.error.message : null;

  // Si el link ya fue consumido o expiró, no hay sesión temporal: mandar a forgot.
  if (status === 'anonymous' && !reset.isSuccess) {
    return <Redirect href="/forgot-password" />;
  }

  function handleSubmit() {
    setFieldErrors({});
    reset.reset();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    reset.mutate({ password: parsed.data.password });
  }

  if (reset.isSuccess) {
    return (
      <ScreenLayout title="Contraseña actualizada" subtitle="Ya podés seguir estudiando.">
        <View className="bg-surface border border-border rounded-xl p-5">
          <Text className="text-text text-base">
            Cambiamos tu contraseña. En un segundo te llevamos a la home.
          </Text>
        </View>
        {/* El onAuthStateChange del store va a mover al usuario a /(protected)/ automáticamente. */}
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Nueva contraseña"
      subtitle="Elegí una contraseña que no hayas usado antes."
    >
      <FormError message={submitError} />

      <Input
        label="Nueva contraseña"
        value={form.password}
        onChangeText={(password) => setForm((f) => ({ ...f, password }))}
        autoComplete="new-password"
        secureToggle
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
        error={fieldErrors.password}
        editable={!reset.isPending}
      />

      <Input
        label="Repetir contraseña"
        value={form.confirmPassword}
        onChangeText={(confirmPassword) => setForm((f) => ({ ...f, confirmPassword }))}
        autoComplete="new-password"
        secureToggle
        error={fieldErrors.confirmPassword}
        editable={!reset.isPending}
      />

      <Button
        label="Cambiar contraseña"
        loading={reset.isPending}
        loadingLabel="Guardando…"
        onPress={handleSubmit}
      />
    </ScreenLayout>
  );
}
