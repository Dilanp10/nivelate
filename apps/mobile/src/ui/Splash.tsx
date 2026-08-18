import { ActivityIndicator, Text, View } from 'react-native';

/** Pantalla de carga mientras el auth store hidrata desde Supabase. */
export function Splash() {
  return (
    <View className="flex-1 bg-bg items-center justify-center gap-4">
      <Text className="text-brand text-4xl font-bold tracking-tight">Nivelate</Text>
      <Text className="text-muted text-base">Inglés A2 → B1</Text>
      <ActivityIndicator color="#58cc02" />
    </View>
  );
}
