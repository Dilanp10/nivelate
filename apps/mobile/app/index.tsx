import { APP_CEFR_RANGE } from '@nivelate/shared';
import { StyleSheet, Text, View } from 'react-native';
import { isSupabaseConfigured } from '../src/lib/supabase';

// NOTE: Home transitorio del módulo 002. Se refactoriza en T054 moviéndolo
// a app/(protected)/index.tsx con el flow real de auth.
type Status = { kind: 'not-configured' } | { kind: 'ready' };

export default function Home() {
  const status: Status = isSupabaseConfigured ? { kind: 'ready' } : { kind: 'not-configured' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nivelate</Text>
      <Text style={styles.subtitle}>Aprendé inglés {APP_CEFR_RANGE.join(' → ')} en serio.</Text>
      <View style={styles.card}>
        <StatusView status={status} />
      </View>
    </View>
  );
}

function StatusView({ status }: { status: Status }) {
  if (status.kind === 'not-configured') {
    return (
      <>
        <Text style={styles.statusEmoji}>⚠️</Text>
        <Text style={styles.statusText}>Supabase no configurado</Text>
        <Text style={styles.statusHint}>
          Copiá <Text style={styles.code}>.env.example</Text> a{' '}
          <Text style={styles.code}>apps/mobile/.env</Text> con tus claves.
        </Text>
      </>
    );
  }
  return (
    <>
      <Text style={styles.statusEmoji}>🛠</Text>
      <Text style={styles.statusText}>Bootstrap OK — armando módulo 002 (auth)</Text>
      <Text style={styles.statusHint}>
        Próximo paso: pantallas de login/signup con NativeWind y route guards.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusEmoji: {
    fontSize: 32,
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  statusHint: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  code: {
    fontFamily: 'monospace',
    color: '#e2e8f0',
    backgroundColor: '#0f172a',
    paddingHorizontal: 4,
  },
});
