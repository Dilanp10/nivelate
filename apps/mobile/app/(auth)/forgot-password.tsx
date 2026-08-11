import { type ForgotPasswordForm, forgotPasswordSchema, toFieldErrors } from '@nivelate/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useForgotPassword } from '../../src/hooks/useForgotPassword';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function ForgotPassword() {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordForm, string>>>(
    {},
  );
  const forgot = useForgotPassword();

  const submitError = forgot.error instanceof Error ? forgot.error.message : null;

  function handleSubmit() {
    setFieldErrors({});
    forgot.reset();
    const parsed = forgotPasswordSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    forgot.mutate(parsed.data);
  }

  if (forgot.isSuccess) {
    return (
      <ScreenLayout title="Revisá tu email" subtitle={form.email}>
        <View className="bg-surface border border-border rounded-xl p-5 gap-2">
          <Text className="text-text text-base">
            Si el email está registrado, te llegó un link para cambiar la contraseña.
          </Text>
          <Text className="text-muted text-sm">El link vence en 1 hora.</Text>
        </View>

        <Link href="/login" className="text-brand text-sm self-center mt-2">
          Volver al login
        </Link>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Recuperar contraseña" subtitle="Te enviamos un link para restablecerla.">
      <FormError message={submitError} />

      <Input
        label="Email"
        value={form.email}
        onChangeText={(email) => setForm({ email })}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={fieldErrors.email}
        editable={!forgot.isPending}
      />

      <Button
        label="Enviar link"
        loading={forgot.isPending}
        loadingLabel="Enviando…"
        onPress={handleSubmit}
      />

      <Link href="/login" className="text-muted text-sm self-center mt-2">
        Volver
      </Link>
    </ScreenLayout>
  );
}
