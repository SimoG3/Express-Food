/**
 * Express Food SVG logo — redrawn to match brand image exactly.
 * Red circle arc + speed lines, green diamond arrow, green car + fork inside.
 */
interface Props {
  size?: number;
  variant?: 'full' | 'mark';
  className?: string;
}

export default function Logo({ size = 40, variant = 'full', className = '' }: Props) {
  const iconH = size;
  const iconW = size * 1.1;

  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Express Food">
      <LogoMark width={iconW} height={iconH} />
      {variant === 'full' && (
        <div
          className="leading-none select-none"
          style={{ fontWeight: 900, letterSpacing: '-0.01em' }}
        >
          <span style={{ fontSize: size * 0.46, color: '#E31E24' }}>EXPRESS </span>
          <span style={{ fontSize: size * 0.46, color: '#2D8A2D' }}>FOOD</span>
        </div>
      )}
    </div>
  );
}

/** Standalone icon mark — use this anywhere you need just the emblem */
export function LogoMark({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Red speed / swoosh lines (left side) ── */}
      <line x1="2"  y1="72"  x2="52"  y2="72"  stroke="#E31E24" strokeWidth="9"  strokeLinecap="round"/>
      <line x1="10" y1="90"  x2="46"  y2="90"  stroke="#E31E24" strokeWidth="7"  strokeLinecap="round"/>
      <line x1="18" y1="106" x2="44"  y2="106" stroke="#E31E24" strokeWidth="5"  strokeLinecap="round"/>

      {/* ── Red open circle arc (the ring around the emblem) ── */}
      {/* Top arc */}
      <path
        d="M 54 85 A 52 52 0 1 1 54 87"
        stroke="#E31E24"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        /* Cut the left side open where the speed lines are */
        strokeDasharray="240 999"
        strokeDashoffset="-30"
      />

      {/* ── Green diamond / arrow (points right) ── */}
      <polygon
        points="100,38  162,85  100,132  70,85"
        fill="#2D8A2D"
      />

      {/* ── Green car body ── */}
      {/* Main cabin */}
      <rect x="76" y="72" width="72" height="30" rx="7" fill="#2D8A2D"/>
      {/* Roof / windshield area */}
      <rect x="88" y="58" width="42" height="22" rx="6" fill="#2D8A2D"/>
      {/* Windshield glass highlight */}
      <rect x="91" y="61" width="36" height="16" rx="4" fill="#1a3d1a" opacity="0.55"/>
      {/* Front bumper */}
      <rect x="140" y="80" width="10" height="14" rx="3" fill="#2D8A2D"/>
      {/* Rear bumper */}
      <rect x="68"  y="80" width="10" height="14" rx="3" fill="#2D8A2D"/>

      {/* ── Wheels ── */}
      <circle cx="90"  cy="104" r="11" fill="#111" stroke="#111" strokeWidth="2"/>
      <circle cx="90"  cy="104" r="5"  fill="#2D8A2D"/>
      <circle cx="130" cy="104" r="11" fill="#111" stroke="#111" strokeWidth="2"/>
      <circle cx="130" cy="104" r="5"  fill="#2D8A2D"/>

      {/* ── Fork overlaid on the car (white) ── */}
      {/* Handle */}
      <line x1="108" y1="52" x2="108" y2="86" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      {/* Tines */}
      <line x1="103" y1="52" x2="103" y2="63" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="108" y1="52" x2="108" y2="63" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="113" y1="52" x2="113" y2="63" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Tine connector curve */}
      <path d="M103 63 Q108 70 113 63" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

/** Dark-background variant — header/footer (default usage) */
export function LogoDark({ size = 40, className = '' }: Omit<Props, 'variant'>) {
  return <Logo size={size} variant="full" className={className} />;
}

/** Light-background variant — same emblem, wordmark colors stay */
export function LogoLight({ size = 40, className = '' }: Omit<Props, 'variant'>) {
  return <Logo size={size} variant="full" className={className} />;
}