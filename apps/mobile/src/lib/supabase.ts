import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { envResult } from '../env';

// Storage adapter: AsyncStorage en native, undefined (defaults a localStorage) en web.
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

// Si las env vars no están configuradas, exportamos null y la app muestra estado "no configurado".
// Esto permite que la app arranque para desarrollo local antes de conectar Supabase.
export const supabase: SupabaseClient | null = envResult.ok
  ? createClient(envResult.env.EXPO_PUBLIC_SUPABASE_URL, envResult.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;
