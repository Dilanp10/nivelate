import { ActivityIndicator, Pressable, type PressableProps, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
};

// Sin labio 3D — el look sobrio prefiere planitud con feedback discreto (opacidad al presionar).
const containerBase =
  'items-center justify-center rounded-xl px-6 py-4 min-h-[52px] flex-row gap-2 border active:opacity-80';

const containerVariants: Record<Variant, string> = {
  primary: 'bg-brand border-brand',
  info: 'bg-info border-info',
  danger: 'bg-danger border-danger',
  secondary: 'bg-surface border-border',
  ghost: 'bg-transparent border-transparent',
};

const containerDisabled = 'bg-surface-light border-border opacity-60';

const labelBase = 'text-base font-semibold tracking-wide font-display';
const labelVariants: Record<Variant, string> = {
  primary: 'text-bg',
  info: 'text-bg',
  danger: 'text-bg',
  secondary: 'text-text',
  ghost: 'text-muted',
};

const spinnerColor: Record<Variant, string> = {
  primary: '#FBFAF8',
  info: '#FBFAF8',
  danger: '#FBFAF8',
  secondary: '#131417',
  ghost: '#6E6E76',
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
      className={`${containerBase} ${isDisabled ? containerDisabled : containerVariants[variant]}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isDisabled ? '#6E6E76' : spinnerColor[variant]} />
      ) : null}
      <Text className={`${labelBase} ${isDisabled ? 'text-muted' : labelVariants[variant]}`}>
        {loading && loadingLabel ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
