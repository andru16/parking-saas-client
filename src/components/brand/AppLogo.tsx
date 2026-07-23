import { APP_LOGO_ALT, APP_LOGO_FULL_SRC, APP_LOGO_MARK_SRC } from '@/branding/logo';

const SIZE_CLASS = {
  xs: 'h-8 w-auto max-w-[7rem]',
  sm: 'h-10 w-auto max-w-[9rem]',
  md: 'h-14 w-auto max-w-[12rem]',
  lg: 'h-24 w-auto max-w-[16rem]',
  xl: 'h-32 w-auto max-w-[20rem] sm:h-40 sm:max-w-[24rem]',
} as const;

const MARK_SIZE_CLASS = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
} as const;

export type AppLogoSize = keyof typeof SIZE_CLASS;
export type AppLogoVariant = 'full' | 'mark';

interface AppLogoProps {
  size?: AppLogoSize;
  /** `full` = icono + texto; `mark` = solo icono (sidebar colapsado, favicon visual). */
  variant?: AppLogoVariant;
  className?: string;
  /** Si true, el logo es decorativo (texto de marca ya visible). */
  decorative?: boolean;
}

export function AppLogo({
  size = 'md',
  variant = 'full',
  className = '',
  decorative = false,
}: AppLogoProps) {
  const isMark = variant === 'mark';
  const src = isMark ? APP_LOGO_MARK_SRC : APP_LOGO_FULL_SRC;
  const sizeClass = isMark ? MARK_SIZE_CLASS[size] : SIZE_CLASS[size];

  return (
    <img
      src={src}
      alt={decorative ? '' : APP_LOGO_ALT}
      aria-hidden={decorative || undefined}
      width={isMark ? 128 : 320}
      height={isMark ? 128 : 256}
      className={`inline-block shrink-0 object-contain ${sizeClass} ${className}`.trim()}
      decoding="async"
      fetchPriority="high"
    />
  );
}
