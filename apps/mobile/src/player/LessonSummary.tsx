import { ACHIEVEMENT_BY_ID, type LessonSummary as Summary } from '@nivelate/shared';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '../ui/Button';

type Props = {
  summary: Summary;
  streak?: number;
  newlyUnlocked?: string[];
  saving?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDone: () => void;
};

export function LessonSummary({
  summary,
  streak,
  newlyUnlocked,
  saving,
  error,
  onRetry,
  onDone,
}: Props) {
  const { total, firstTryCorrect, estimatedXp } = summary;
  const pct = total === 0 ? 0 : Math.round((firstTryCorrect / total) * 100);

  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      <Text className="text-5xl">🎉</Text>
      <Text className="text-text text-2xl font-bold">¡Lección completa!</Text>

      <View className="w-full max-w-xs gap-3">
        <Row label="Aciertos al primer intento" value={`${firstTryCorrect}/${total} (${pct}%)`} />
        <Row label="XP ganada" value={saving ? '…' : `+${estimatedXp}`} loading={saving} />
        {typeof streak === 'number' ? (
          <Row label="Racha" value={`🔥 ${streak} ${streak === 1 ? 'día' : 'días'}`} />
        ) : null}
      </View>

      {newlyUnlocked && newlyUnlocked.length > 0 ? (
        <View
          className="w-full max-w-xs bg-brand/10 border border-brand rounded-lg px-3 py-2 gap-1"
          accessibilityRole="alert"
        >
          <Text className="text-brand text-sm font-semibold">
            🏅 Desbloqueaste{newlyUnlocked.length === 1 ? '' : ` ${newlyUnlocked.length} logros`}:
          </Text>
          <Text className="text-text text-sm">
            {newlyUnlocked.map((id) => ACHIEVEMENT_BY_ID[id]?.title ?? id).join(', ')}
          </Text>
        </View>
      ) : null}

      {error ? (
        <View className="w-full max-w-xs gap-2">
          <Text className="text-danger text-sm text-center">{error}</Text>
          {onRetry ? <Button label="Reintentar" variant="secondary" onPress={onRetry} /> : null}
        </View>
      ) : null}

      <View className="w-full max-w-xs">
        <Button label="Volver" onPress={onDone} disabled={saving} />
      </View>
    </View>
  );
}

function Row({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <Text className="text-muted text-sm">{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#22d3ee" />
      ) : (
        <Text className="text-text text-base font-semibold">{value}</Text>
      )}
    </View>
  );
}
