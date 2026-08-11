import { useState } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';

type Props = Omit<TextInputProps, 'placeholderTextColor'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Si es true, agrega botón "Mostrar/Ocultar" y arranca ofuscado. */
  secureToggle?: boolean;
};

export function Input({
  label,
  error,
  hint,
  secureToggle = false,
  secureTextEntry,
  ...inputProps
}: Props) {
  const [visible, setVisible] = useState(!secureToggle && !secureTextEntry);
  const isSecure = secureToggle ? !visible : Boolean(secureTextEntry);
  const hasError = Boolean(error);

  return (
    <View className="gap-1.5">
      <Text className="text-text text-sm font-medium">{label}</Text>

      <View
        className={`flex-row items-center bg-surface border rounded-lg px-3 ${
          hasError ? 'border-danger' : 'border-border'
        }`}
      >
        <TextInput
          {...inputProps}
          secureTextEntry={isSecure}
          placeholderTextColor="#64748b"
          className="flex-1 text-text text-base py-3"
          accessibilityLabel={label}
          accessibilityHint={hint}
        />

        {secureToggle ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="px-2 py-2"
          >
            <Text className="text-muted text-sm">{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text className="text-danger text-xs" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-muted text-xs">{hint}</Text>
      ) : null}
    </View>
  );
}
