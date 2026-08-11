// Tipos globales committeados. A diferencia de expo-env.d.ts (que Expo regenera
// y está en .gitignore), este archivo se versiona, así el typecheck funciona en
// CI aunque el dev server nunca haya corrido.
/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}
