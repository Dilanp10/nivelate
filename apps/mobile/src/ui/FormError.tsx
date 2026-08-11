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
      className="bg-danger/10 border border-danger/40 rounded-lg px-3 py-2"
    >
      <Text className="text-danger text-sm">{message}</Text>
    </View>
  );
}
