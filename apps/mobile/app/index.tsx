import { APP_CEFR_RANGE } from '@nivelate/shared';
import { Text, View } from 'react-native';
import { isSupabaseConfigured } from '../src/lib/supabase';

// Home transitorio del módulo 002. Se reemplaza en T054 moviéndolo
// a app/(protected)/index.tsx con el flow real de auth.
export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-bg p-6 gap-4">
      <Text className="text-text text-5xl font-bold tracking-tight">Nivelate</Text>
      <Text className="text-muted text-base text-center mb-6">
        Aprendé inglés {APP_CEFR_RANGE.join(' → ')} en serio.
      </Text>

      <View className="bg-surface p-6 rounded-xl items-center gap-2 min-w-[280px] border border-border">
        {isSupabaseConfigured ? (
          <>
            <Text className="text-3xl">🛠</Text>
            <Text className="text-text text-base font-semibold text-center">
              Bootstrap OK — armando módulo 002 (auth)
            </Text>
            <Text className="text-muted text-xs text-center">
              Próximo paso: login/signup con NativeWind + route guards.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-3xl">⚠️</Text>
            <Text className="text-text text-base font-semibold text-center">
              Supabase no configurado
            </Text>
            <Text className="text-muted text-xs text-center">
              Copiá .env.example a apps/mobile/.env con tus claves.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
