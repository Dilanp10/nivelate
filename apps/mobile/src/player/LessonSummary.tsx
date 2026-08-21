import { ACHIEVEMENT_BY_ID, type LessonSummary as Summary } from '@nivelate/shared';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';

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
  // El encabezado se adapta al resultado: felicitar un 40% suena falso.
  const headline =
    pct >= 80 ? '¡Excelente!' : pct >= 50 ? '¡Lección completa!' : 'Lección terminada';
  const iconName: IconName = pct >= 80 ? 'party' : pct >= 50 ? 'sparkle' : 'target';
  const iconColor = pct >= 80 ? '#0E7C7B' : pct >= 50 ? '#B88A2E' : '#4F6D7A';

  return (
    <View className="flex-1 items-center justify-center gap-7 px-6">
      <View className="items-center gap-3">
        <Icon name={iconName} size={64} color={iconColor} strokeWidth={1.4} />
        <Text className="text-brand text-3xl font-bold">{headline}</Text>
      </View>

      <View className="w-full max-w-xs flex-row gap-3">
        <StatBox label="Aciertos" value={`${pct}%`} tone="text-brand" />
        <StatBox
          label="XP ganada"
          value={saving ? '…' : `+${estimatedXp}`}
          tone="text-gold"
          loading={saving}
        />
        {typeof streak === 'number' ? (
          <StatBox label="Racha" value={`${streak}`} tone="text-streak" />
        ) : null}
      </View>

      <Text className="text-muted text-sm">
        {firstTryCorrect} de {total} al primer intento
      </Text>

      {newlyUnlocked && newlyUnlocked.length > 0 ? (
        <View
          className="w-full max-w-xs bg-gold/10 border-2 border-gold rounded-2xl px-4 py-3 gap-1"
          accessibilityRole="alert"
        >
          <View className="flex-row items-center gap-2">
            <Icon name="medal" size={18} color="#B88A2E" />
            <Text className="text-gold text-sm font-bold">
              Desbloqueaste{newlyUnlocked.length === 1 ? '' :` ${newlyUnlocked.length} logros`}:
            </Text>
          </View>
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

function StatBox({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: string;
  tone: string;
  loading?: boolean;
}) {
  return (
    <View className="flex-1 items-center gap-1 bg-surface border-2 border-border rounded-2xl py-3">
      {loading ? (
        <ActivityIndicator size="small" color="#0E7C7B" />
      ) : (
        <Text className={`text-xl font-bold ${tone}`}>{value}</Text>
      )}
      <Text className="text-muted text-xs">{label}</Text>
    </View>
  );
}
