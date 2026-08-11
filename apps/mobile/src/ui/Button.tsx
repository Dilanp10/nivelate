import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
};

const containerBase =
  'items-center justify-center rounded-lg px-4 py-3 min-h-[48px] flex-row gap-2';

const containerVariants: Record<Variant, string> = {
  primary: 'bg-brand active:bg-brand-dark disabled:opacity-50',
  secondary: 'bg-surface border border-border active:bg-border disabled:opacity-50',
  ghost: 'bg-transparent active:bg-surface disabled:opacity-50',
};

const labelBase = 'text-base font-semibold';
const labelVariants: Record<Variant, string> = {
  primary: 'text-bg',
  secondary: 'text-text',
  ghost: 'text-text',
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  loadingLabel,
  disabled,
  accessibilityLabel,
  ...pressableProps
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`${containerBase} ${containerVariants[variant]}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#0f172a' : '#f8fafc'}
        />
      ) : null}
      <Text className={`${labelBase} ${labelVariants[variant]}`}>
        {loading && loadingLabel ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
