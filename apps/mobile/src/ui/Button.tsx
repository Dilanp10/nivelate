import { ActivityIndicator, Pressable, type PressableProps, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
};

// El "labio" inferior (border-b-4) más el translate en active dan la sensación
// de tecla física que se hunde al tocarla. Es la interacción firma del estilo.
const containerBase =
  'items-center justify-center rounded-2xl px-6 py-4 min-h-[56px] flex-row gap-2 border-b-4 active:border-b-0 active:translate-y-1';

const containerVariants: Record<Variant, string> = {
  primary: 'bg-brand border-brand-dark',
  info: 'bg-info border-info-dark',
  danger: 'bg-danger border-danger-dark',
  secondary: 'bg-surface border-border active:bg-surface-light',
  ghost: 'bg-transparent border-transparent active:bg-surface',
};

// Deshabilitado va a gris neutro en vez de al color lavado: un verde al 40%
// se lee como "verde feo", no como "todavía no".
const containerDisabled = 'bg-surface border-border opacity-60';

const labelBase = 'text-base font-bold tracking-wide';
const labelVariants: Record<Variant, string> = {
  primary: 'text-bg',
  info: 'text-bg',
  danger: 'text-text',
  secondary: 'text-text',
  ghost: 'text-muted',
};

const spinnerColor: Record<Variant, string> = {
  primary: '#131f24',
  info: '#131f24',
  danger: '#f7fafc',
  secondary: '#f7fafc',
  ghost: '#8fa3ad',
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
        <ActivityIndicator size="small" color={isDisabled ? '#8fa3ad' : spinnerColor[variant]} />
      ) : null}
      <Text className={`${labelBase} ${isDisabled ? 'text-muted' : labelVariants[variant]}`}>
        {loading && loadingLabel ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
