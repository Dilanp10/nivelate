import { type MagicLinkForm, magicLinkSchema, toFieldErrors } from '@nivelate/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useMagicLink } from '../../src/hooks/useMagicLink';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function MagicLink() {
  const [form, setForm] = useState<MagicLinkForm>({ email: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MagicLinkForm, string>>>({});
  const magic = useMagicLink();

  const submitError = magic.error instanceof Error ? magic.error.message : null;

  function handleSubmit() {
    setFieldErrors({});
    magic.reset();
    const parsed = magicLinkSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }
    magic.mutate(parsed.data);
  }

  if (magic.isSuccess) {
    return (
      <ScreenLayout title="Revisá tu email" subtitle={form.email}>
        <View className="bg-surface border border-border rounded-xl p-5 gap-2">
          <Text className="text-text text-base">
            Si el email está registrado, te llegó un link para entrar sin contraseña.
          </Text>
          <Text className="text-muted text-sm">Revisá también la carpeta de spam.</Text>
        </View>

        <Link href="/login" className="text-brand text-sm self-center mt-2">
          Volver al login
        </Link>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Link mágico" subtitle="Te enviamos un link para entrar sin contraseña.">
      <FormError message={submitError} />

      <Input
        label="Email"
        value={form.email}
        onChangeText={(email) => setForm({ email })}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={fieldErrors.email}
        editable={!magic.isPending}
      />

      <Button
        label="Enviarme el link"
        loading={magic.isPending}
        loadingLabel="Enviando…"
        onPress={handleSubmit}
      />

      <Link href="/login" className="text-muted text-sm self-center mt-2">
        Prefiero usar contraseña
      </Link>
    </ScreenLayout>
  );
}
