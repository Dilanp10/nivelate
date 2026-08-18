import { type LoginForm, loginSchema, toFieldErrors } from '@nivelate/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '../../src/hooks/useSignIn';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const signIn = useSignIn();

  const submitError = signIn.error instanceof Error ? signIn.error.message : null;

  function handleSubmit() {
    setFieldErrors({});
    signIn.reset();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    signIn.mutate(parsed.data);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-8 pb-8 gap-6 w-full max-w-md mx-auto">
        {/* Logo area */}
        <View className="items-center gap-3 mb-4">
          <Text className="text-brand text-4xl font-bold tracking-tight">Nivelate</Text>
          <Text className="text-muted text-base">Retomá donde dejaste.</Text>
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
          editable={!signIn.isPending}
        />

        <Input
          label="Contraseña"
          value={form.password}
          onChangeText={(password) => setForm((f) => ({ ...f, password }))}
          autoComplete="current-password"
          secureToggle
          error={fieldErrors.password}
          editable={!signIn.isPending}
        />

        <Link href="/forgot-password" className="text-brand text-sm self-end">
          ¿Olvidaste tu contraseña?
        </Link>

        <Button
          label="Entrar"
          loading={signIn.isPending}
          loadingLabel="Entrando…"
          onPress={handleSubmit}
        />

        <View className="items-center gap-3 mt-2">
          <Link href="/magic-link" className="text-muted text-sm">
            Entrar con link mágico
          </Link>
          <Text className="text-muted text-sm">
            ¿No tenés cuenta?{' '}
            <Link href="/signup" className="text-brand underline font-semibold">
              Crear cuenta
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
