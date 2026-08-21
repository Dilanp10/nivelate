import Svg, { Path, Circle, Line } from 'react-native-svg';

// Pack de iconografía "Tinta editorial" — trazo dibujado a mano, un solo color,
// pensado para reemplazar los emoji del sistema. Ver artifact de decisión (dir. C).
// Todos comparten viewBox 32x32 y stroke redondeado; el color se pasa por prop.

export type IconName =
  | 'flame'
  | 'bolt'
  | 'star'
  | 'sparkle'
  | 'book'
  | 'cap'
  | 'target'
  | 'flag'
  | 'trophy'
  | 'medal'
  | 'wave'
  | 'chart'
  | 'repeat'
  | 'gear'
  | 'sprout'
  | 'note'
  | 'party'
  | 'lock'
  | 'plane'
  | 'briefcase'
  | 'film'
  | 'globe'
  | 'letters'
  | 'speech'
  | 'clock';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 28, color = '#131417', strokeWidth = 1.5 }: Props) {
  const common: SvgProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {PATHS[name](common)}
    </Svg>
  );
}

type SvgProps = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: 'none';
};

const PATHS: Record<IconName, (p: SvgProps) => React.ReactElement> = {
  flame: (p) => (
    <>
      <Path
        {...p}
        d="M17 4.2c.4 3 3.8 4.4 4.6 8.2.9 4-1.9 8.5-6 8.4-4.4-.1-6.9-3.3-6.4-6.8.3-1.6 1.1-2.5 1.7-3.1-.2 1.6.6 3 1.8 3.2 1.2.1 2.1-.9 2-2.4-.2-2.6.4-5 2.3-7.5z"
      />
      <Path {...p} d="M13.6 14.6c.3 1.2 1.3 1.8 2.6 1.6" />
    </>
  ),

  bolt: (p) => (
    <>
      <Path
        {...p}
        d="M19 3.5 6.8 19.2c2.7-.1 5.3-.1 8-.1L13 29.3c3.9-5.4 8.2-10.4 12.4-15.9-2.7-.1-5.4-.1-8-.1z"
      />
      <Path {...p} d="M11 15.5c.6.1 1.1.2 1.6.5" />
    </>
  ),

  star: (p) => (
    <>
      <Path
        {...p}
        d="M16 4.2c1.4 2.6 2.9 5.1 4.4 7.6 2.8.3 5.6.6 8.4 1.1-2.1 1.9-4.3 3.7-6.4 5.6.6 2.8 1.3 5.5 2 8.3-2.6-1.4-5.1-2.9-7.6-4.4-2.5 1.5-5 3-7.6 4.4.7-2.8 1.3-5.5 2-8.3-2.1-1.9-4.3-3.7-6.4-5.6 2.8-.4 5.6-.7 8.4-1 1.5-2.6 2.9-5.1 4.4-7.7z"
      />
    </>
  ),

  sparkle: (p) => (
    <>
      <Path {...p} d="M16 4c.7 3.3 2.6 5.4 6 6.1-3.4.7-5.3 2.8-6 6.1-.7-3.3-2.6-5.4-6-6.1 3.4-.7 5.3-2.8 6-6.1z" />
      <Path {...p} d="M24 18c.4 1.7 1.4 2.7 3 3-1.6.3-2.6 1.4-3 3-.4-1.7-1.4-2.7-3-3 1.6-.3 2.6-1.4 3-3z" />
      <Path {...p} d="M9 22c.3 1.2 1 1.9 2.2 2.2-1.1.3-1.9 1-2.2 2.2-.3-1.2-1-1.9-2.2-2.2 1.2-.3 1.9-1 2.2-2.2z" />
    </>
  ),

  book: (p) => (
    <>
      <Path {...p} d="M4 6.5c3.5-.7 6.9-.8 9 .5v18c-2.5-1.4-6.1-1.3-9-.5z" />
      <Path {...p} d="M28 6.5c-3.5-.7-6.9-.8-9 .5v18c2.5-1.4 6.1-1.3 9-.5z" />
      <Path {...p} d="M13 7v18M19 7v18" />
      <Path {...p} d="M6.5 11h4M6.5 14h4M6.5 17h4" />
      <Path {...p} d="M21.5 11h4M21.5 14h4M21.5 17h4" />
    </>
  ),

  cap: (p) => (
    <>
      <Path {...p} d="M2.5 12 16 6.5 29.5 12 16 17.5z" />
      <Path {...p} d="M8 14.5v6.5c0 1.8 3.6 3.5 8 3.5s8-1.7 8-3.5v-6.5" />
      <Path {...p} d="M27 13v7" />
      <Path {...p} d="M27 20c-.4 1-.4 2 0 3" />
    </>
  ),

  target: (p) => (
    <>
      <Circle cx="16" cy="16" r="12.4" {...p} />
      <Circle cx="16" cy="16" r="7.8" {...p} />
      <Circle cx="16" cy="16" r="3.2" {...p} />
      <Path {...p} d="M16 16 24 8" />
      <Path {...p} d="m22 6 2 2v2.4M22 6h2.4L26 8" />
    </>
  ),

  flag: (p) => (
    <>
      <Path {...p} d="M6 4v25" />
      <Path
        {...p}
        d="M6 5.5c4 0 8 2 12 2s6-1.5 8-1.5v11c-2 0-4 1.5-8 1.5s-8-2-12-2z"
      />
      <Path {...p} d="M10 7.5v3.5M14 8v3.5M18 8v3.5M22 7v3.5" />
      <Path {...p} d="M10 11v3.5M14 11.5v3.5M18 11.5v3.5M22 10.5v3.5" />
    </>
  ),

  trophy: (p) => (
    <>
      <Path {...p} d="M10 4.5h12c0 3-.1 5.7-.4 8-.5 3.6-2.8 6-5.6 6s-5.1-2.4-5.6-6c-.3-2.3-.4-5-.4-8z" />
      <Path {...p} d="M10 6.5c-1.6 0-3.2-.1-4.8 0 .3 3.5 2.1 5.3 4.8 5.5" />
      <Path {...p} d="M22 6.5c1.6 0 3.2-.1 4.8 0-.3 3.5-2.1 5.3-4.8 5.5" />
      <Path {...p} d="M13 18.5c-.4 1.7-.7 3.4-1 5.1h8c-.3-1.7-.6-3.4-1-5.1" />
      <Path {...p} d="M9 27h14" />
    </>
  ),

  medal: (p) => (
    <>
      <Path {...p} d="m10 4-2 8M22 4l2 8" />
      <Circle cx="16" cy="20" r="8" {...p} />
      <Path {...p} d="M13 17c1.5 1.2 2.5 3 3 5 1.5-2 3-3.8 5-5" />
    </>
  ),

  wave: (p) => (
    <>
      <Path {...p} d="M11 14V6.5a2 2 0 0 1 4 0V15" />
      <Path {...p} d="M15 15V4.5a2 2 0 0 1 4 0V15" />
      <Path {...p} d="M19 15V6.5a2 2 0 0 1 4 0V17" />
      <Path
        {...p}
        d="M23 12c1.5-.6 3-.4 3.5 1 .5 1.5-1 4.5-3 7-2.4 3-5 4.5-8 4.5-3.6 0-6.5-2.4-7.5-6-.6-2 0-3.5 1.5-4"
      />
      <Path {...p} d="M11 14c-.5-.6-1-1-1.5-1.3" />
      <Path {...p} d="M25 6c1-.4 1.8-1 2.4-1.8M27 9c1.2 0 2.2-.3 3-.9M26 12.5c1 .3 2 .3 3 0" />
    </>
  ),

  chart: (p) => (
    <>
      <Path {...p} d="M5 5v22h22" />
      <Path {...p} d="M9 23v-6M14 23v-11M19 23v-4M24 23v-14" />
      <Path {...p} d="M9 12 14 8l5 5 5-8" />
    </>
  ),

  repeat: (p) => (
    <>
      <Path {...p} d="M6 12a10 10 0 0 1 17-3" />
      <Path {...p} d="M23 4v5.5h-5.5" />
      <Path {...p} d="M26 20a10 10 0 0 1-17 3" />
      <Path {...p} d="M9 28v-5.5h5.5" />
    </>
  ),

  gear: (p) => (
    <>
      <Path
        {...p}
        d="M16 3.5c.9 0 1.7.1 2.5.3l.6 2.6c.7.2 1.4.5 2 .9l2.5-.9c1.2 1 2.2 2.2 2.9 3.6l-1.7 2c.2.7.4 1.5.4 2.2l2.4 1.2c-.1 1.5-.5 3-1.1 4.3l-2.6-.1c-.4.6-.8 1.2-1.3 1.7l.7 2.5c-1.1 1-2.4 1.9-3.8 2.4l-1.8-1.9c-.7.1-1.5.2-2.2.1l-1.4 2.2c-1.5-.2-3-.7-4.2-1.5l.4-2.6c-.6-.4-1.1-.9-1.6-1.5l-2.6.2c-.8-1.3-1.3-2.7-1.5-4.2l2.3-1.3c0-.7.1-1.5.3-2.2l-2-1.7c.5-1.4 1.3-2.8 2.4-3.9l2.5.9c.6-.4 1.3-.7 2-.9l.5-2.6c.9-.2 1.7-.3 2.6-.3z"
      />
      <Circle cx="16" cy="16" r="4" {...p} />
    </>
  ),

  sprout: (p) => (
    <>
      <Path {...p} d="M16 27V16" />
      <Path {...p} d="M16 16c-2-4-6-5.5-11-5 0 5 3 9 7 10 1.6.4 3 .3 4-.5" />
      <Path {...p} d="M16 18c1.5-3.5 5-5 9.5-4.5 0 4-2.5 7.5-6 8.5-1.4.4-2.6.3-3.5-.4" />
      <Path {...p} d="M8 27h16" />
    </>
  ),

  note: (p) => (
    <>
      <Path {...p} d="M8 4h12l4 4v20H8z" />
      <Path {...p} d="M20 4v4h4" />
      <Path {...p} d="M12 14h8M12 18h8M12 22h5" />
    </>
  ),

  party: (p) => (
    <>
      <Path {...p} d="M4 28 12 8l12 12z" />
      <Path {...p} d="M12 8c1.5 1.5 3 4 3 6" />
      <Path {...p} d="M8 18h4M10 23h6" />
      <Path {...p} d="M22 4v3M26 6l-1.5 2M28 12h-3" />
      <Path {...p} d="M18 4c1 1 2 1 3 0" />
    </>
  ),

  lock: (p) => (
    <>
      <Path {...p} d="M8 14h16v13H8z" />
      <Path {...p} d="M11 14v-4a5 5 0 0 1 10 0v4" />
      <Path {...p} d="M16 19v3.5" />
    </>
  ),

  plane: (p) => (
    <>
      <Path
        {...p}
        d="M14 4c.6 0 1.2.5 1.4 1.4l.6 8.6 10 5v2.5l-10-2.5-1 6.5 3 2v1.5l-4-1-4 1V27l3-2-1-6.5-10 2.5V18.5l10-5 .6-8.6C12.8 4.5 13.4 4 14 4z"
      />
    </>
  ),

  briefcase: (p) => (
    <>
      <Path {...p} d="M5 10h22v16H5z" />
      <Path {...p} d="M12 10V7.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5V10" />
      <Path {...p} d="M5 16c4 1.5 8 2 11 2s7-.5 11-2" />
      <Path {...p} d="M14 16v2M18 16v2" />
    </>
  ),

  film: (p) => (
    <>
      <Path {...p} d="M5 5h22v22H5z" />
      <Circle cx="9" cy="9" r="1.4" {...p} />
      <Circle cx="9" cy="16" r="1.4" {...p} />
      <Circle cx="9" cy="23" r="1.4" {...p} />
      <Circle cx="23" cy="9" r="1.4" {...p} />
      <Circle cx="23" cy="16" r="1.4" {...p} />
      <Circle cx="23" cy="23" r="1.4" {...p} />
      <Path {...p} d="M13 5v22M19 5v22" />
    </>
  ),

  globe: (p) => (
    <>
      <Circle cx="16" cy="16" r="12" {...p} />
      <Path {...p} d="M4 16h24" />
      <Path {...p} d="M16 4c3.2 3.4 5 7.6 5 12s-1.8 8.6-5 12c-3.2-3.4-5-7.6-5-12s1.8-8.6 5-12z" />
    </>
  ),

  letters: (p) => (
    <>
      <Path {...p} d="M4 22l4-13 4 13" />
      <Path {...p} d="M5.5 18h5" />
      <Path {...p} d="M15 22V9h4a3.5 3.5 0 0 1 0 7h-4" />
      <Path {...p} d="M19 16h.5a3.5 3.5 0 0 1 0 7H15" />
      <Path {...p} d="M28 12c-.6-.8-1.5-1.2-2.5-1.2-1.7 0-3 1-3 3s1.3 2.8 3 2.8c1 0 1.9-.4 2.5-1.2" />
    </>
  ),

  speech: (p) => (
    <>
      <Path {...p} d="M4 7h20v14h-9l-6 5v-5H4z" />
      <Path {...p} d="M9 12h10M9 16h6" />
    </>
  ),

  clock: (p) => (
    <>
      <Circle cx="16" cy="16" r="12" {...p} />
      <Path {...p} d="M16 8v8l5 3" />
      <Path {...p} d="M16 3v2M16 27v2M3 16h2M27 16h2" />
    </>
  ),
};
