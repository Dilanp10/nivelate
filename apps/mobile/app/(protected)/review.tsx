import { useRouter } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDueCards } from '../../src/hooks/useDueCards';
import { ReviewRunner } from '../../src/review/ReviewRunner';
import { Button } from '../../src/ui/Button';

export default function ReviewScreen() {
  const router = useRouter();
  const query = useDueCards();

  if (query.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#0E7C7B" />
      </SafeAreaView>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-4">
        <Text className="text-text text-base text-center">
          No se pudo cargar tu repaso.
          {query.error instanceof Error ? `\n${query.error.message}` : ''}
        </Text>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (query.data.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-4">
        <Text className="text-5xl">✓</Text>
        <Text className="text-text text-xl font-bold">Al día con el repaso</Text>
        <Text className="text-muted text-sm text-center max-w-xs">
          No tenés cards para revisar hoy. Cuando completes más lecciones, aparecerán acá al día
          siguiente.
        </Text>
        <Button label="Volver" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return <ReviewRunner cards={query.data} onExit={() => router.back()} />;
}
