import { ActivityIndicator, Text, View } from 'react-native';

/** Pantalla de carga mientras el auth store hidrata desde Supabase. */
export function Splash() {
  return (
    <View className="flex-1 bg-bg items-center justify-center gap-3">
      <Text className="text-text text-3xl font-bold tracking-tight">Nivelate</Text>
      <ActivityIndicator color="#22d3ee" />
    </View>
  );
}
