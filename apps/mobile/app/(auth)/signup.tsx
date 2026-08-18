import { type SignupForm, signupSchema, toFieldErrors } from '@nivelate/shared';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSignUp } from '../../src/hooks/useSignUp';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupForm, string>>>({});
  const signUp = useSignUp();

  const submitError = signUp.error instanceof Error ? signUp.error.message : null;

  function handleSubmit() {
    setFieldErrors({});
    signUp.reset();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    signUp.mutate(parsed.data, {
      onSuccess: () => {
        // Supabase envía email de confirmación. La sesión queda null hasta que confirme.
        router.replace(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
      },
    });
  }

  return (
    <ScreenLayout title="Crear cuenta" subtitle="Aprender inglés A2 → B1, en serio.">
      <FormError message={submitError} />

      <Input
        label="Email"
        value={form.email}
        onChangeText={(email) => setForm((f) => ({ ...f, email }))}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={fieldErrors.email}
        editable={!signUp.isPending}
      />

      <Input
        label="Contraseña"
        value={form.password}
        onChangeText={(password) => setForm((f) => ({ ...f, password }))}
        autoComplete="new-password"
        secureToggle
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
        error={fieldErrors.password}
        editable={!signUp.isPending}
      />

      <Button
        label="Crear cuenta"
        loading={signUp.isPending}
        loadingLabel="Creando…"
        onPress={handleSubmit}
      />

      <View className="items-center mt-2">
        <Text className="text-muted text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-brand underline">
            Entrar
          </Link>
        </Text>
      </View>
    </ScreenLayout>
  );
}
