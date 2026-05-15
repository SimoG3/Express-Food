interface Props {
  size?: number;
  variant?: 'full' | 'mark';
  className?: string;
}

export default function Logo({ size = 40, className = '' }: Props) {
  return (
    <img
      src="/logo.png"
      alt="Express Food"
      style={{ height: size * 1.4, width: 'auto', objectFit: 'contain' }}
      className={className}
    />
  );
}

export function LogoMark({ width, height }: { width: number; height: number }) {
  return (
    <img
      src="/logo.png"
      alt="Express Food"
      style={{ height: height * 1.4, width: 'auto', objectFit: 'contain' }}
    />
  );
}

export function LogoDark({ size = 40, className = '' }: Omit<Props, 'variant'>) {
  return <Logo size={size} className={className} />;
}

export function LogoLight({ size = 40, className = '' }: Omit<Props, 'variant'>) {
  return <Logo size={size} className={className} />;
}