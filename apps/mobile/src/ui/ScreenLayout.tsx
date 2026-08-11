import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Si true, el contenido no scrollea (útil en pantallas cortas). */
  fixed?: boolean;
};

export function ScreenLayout({ title, subtitle, children, fixed = false }: Props) {
  const content = (
    <View className="flex-1 px-6 pt-4 pb-8 gap-6 w-full max-w-md mx-auto">
      {title ? (
        <View className="gap-2">
          <Text className="text-text text-3xl font-bold tracking-tight">{title}</Text>
          {subtitle ? <Text className="text-muted text-base">{subtitle}</Text> : null}
        </View>
      ) : null}
      <View className="flex-1 gap-4">{children}</View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {fixed ? (
          content
        ) : (
          <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
            {content}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
