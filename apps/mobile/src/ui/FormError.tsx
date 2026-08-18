import { Text, View } from 'react-native';

type Props = {
  message: string | null | undefined;
};

/** Banner de error para el submit de un form (distinto a errores inline por campo). */
export function FormError({ message }: Props) {
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      className="bg-danger/10 border-2 border-danger/40 rounded-2xl px-4 py-3"
    >
      <Text className="text-danger text-sm font-semibold">{message}</Text>
    </View>
  );
}
