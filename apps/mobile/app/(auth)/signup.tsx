import { type SignupForm, signupSchema, toFieldErrors } from '@nivelate/shared';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '../../src/hooks/useSignUp';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';

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
        router.replace(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-8 pb-8 gap-6 w-full max-w-md mx-auto">
        {/* Logo area */}
        <View className="items-center gap-3 mb-4">
          <Text className="text-brand text-4xl font-bold tracking-tight">Nivelate</Text>
          <Text className="text-muted text-base">Aprender inglés A2 → B1, en serio.</Text>
        </View>

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
            <Link href="/login" className="text-brand underline font-semibold">
              Entrar
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
