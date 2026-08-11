import { APP_CEFR_RANGE } from '@nivelate/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';

type Status =
  | { kind: 'loading' }
  | { kind: 'not-configured' }
  | { kind: 'connected'; note: string }
  | { kind: 'error'; message: string };

export default function Home() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus({ kind: 'not-configured' });
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('_bootstrap_ping')
        .select('note')
        .limit(1)
        .maybeSingle();

      if (error) {
        setStatus({ kind: 'error', message: error.message });
      } else {
        setStatus({ kind: 'connected', note: data?.note ?? '(sin nota)' });
      }
    })();
  }, []);

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
  switch (status.kind) {
    case 'loading':
      return (
        <>
          <ActivityIndicator color="#f8fafc" />
          <Text style={styles.statusText}>Verificando conexión...</Text>
        </>
      );
    case 'not-configured':
      return (
        <>
          <Text style={styles.statusEmoji}>⚠️</Text>
          <Text style={styles.statusText}>Supabase no configurado</Text>
          <Text style={styles.statusHint}>
            Copiá <Text style={styles.code}>.env.example</Text> a{' '}
            <Text style={styles.code}>.env</Text> con tus claves.
          </Text>
        </>
      );
    case 'connected':
      return (
        <>
          <Text style={styles.statusEmoji}>✓</Text>
          <Text style={styles.statusText}>Conectado a Supabase</Text>
          <Text style={styles.statusHint}>ping: {status.note}</Text>
        </>
      );
    case 'error':
      return (
        <>
          <Text style={styles.statusEmoji}>❌</Text>
          <Text style={styles.statusText}>Error de conexión</Text>
          <Text style={styles.statusHint}>{status.message}</Text>
        </>
      );
  }
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
