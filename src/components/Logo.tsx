/**
 * Express Food SVG logo — inline component.
 * Replicates the speed-car-fork motif with red arc + green arrow/diamond.
 */
interface Props {
  size?: number;    // height of the icon mark in px
  variant?: 'full' | 'mark';  // full = icon + wordmark; mark = icon only
  className?: string;
}

export default function Logo({ size = 40, variant = 'full', className = '' }: Props) {
  const iconH = size;
  const iconW = size * 1.15;

  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Express Food">
      {/* SVG icon mark */}
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 115 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Red speed lines */}
        <line x1="0"  y1="42" x2="28" y2="42" stroke="#E31E24" strokeWidth="5" strokeLinecap="round"/>
        <line x1="5"  y1="54" x2="22" y2="54" stroke="#E31E24" strokeWidth="4" strokeLinecap="round"/>
        <line x1="10" y1="65" x2="20" y2="65" stroke="#E31E24" strokeWidth="3" strokeLinecap="round"/>

        {/* Red circular arc (top half) */}
        <path d="M30 50 A34 34 0 0 1 98 50" stroke="#E31E24" strokeWidth="5" strokeLinecap="round" fill="none"/>

        {/* Green diamond / arrow background */}
        <polygon points="55,18 98,50 55,82 40,50" fill="#2D8A2D"/>

        {/* Delivery car body */}
        <rect x="42" y="52" width="46" height="20" rx="4" fill="#111111"/>
        <rect x="52" y="43" width="28" height="16" rx="3" fill="#111111"/>
        {/* Windshield */}
        <rect x="54" y="45" width="22" height="12" rx="2" fill="#2D8A2D" opacity="0.7"/>
        {/* Wheels */}
        <circle cx="52" cy="74" r="7" fill="#111111" stroke="#E31E24" strokeWidth="2"/>
        <circle cx="52" cy="74" r="3" fill="#E31E24"/>
        <circle cx="78" cy="74" r="7" fill="#111111" stroke="#E31E24" strokeWidth="2"/>
        <circle cx="78" cy="74" r="3" fill="#E31E24"/>

        {/* Fork (speed element) */}
        <line x1="64" y1="30" x2="66" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="60" y1="30" x2="60" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="64" y1="30" x2="64" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="68" y1="30" x2="68" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Red arc bottom */}
        <path d="M30 50 A34 34 0 0 0 98 50" stroke="#E31E24" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="6 3"/>
      </svg>

      {/* Wordmark */}
      {variant === 'full' && (
        <div className="leading-none select-none" style={{ fontSize: size * 0.42, fontWeight: 900, letterSpacing: '-0.01em' }}>
          <span style={{ color: '#E31E24' }}>EXPRESS</span>
          {' '}
          <span style={{ color: '#2D8A2D' }}>FOOD</span>
          <div style={{ fontSize: size * 0.18, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.06em', marginTop: '1px' }}>
            LIVRAISON EXPRESS
          </div>
        </div>
      )}
    </div>
  );
}

/** Dark-background variant (for headers/footers) */
export function LogoDark(props: Omit<Props, 'variant'>) {
  return <Logo {...props} variant="full" />;
}

/** Light-background variant */
export function LogoLight({ size = 40, className = '' }: Omit<Props, 'variant'>) {
  const iconH = size;
  const iconW = size * 1.15;
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Express Food">
      <svg width={iconW} height={iconH} viewBox="0 0 115 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0"  y1="42" x2="28" y2="42" stroke="#E31E24" strokeWidth="5" strokeLinecap="round"/>
        <line x1="5"  y1="54" x2="22" y2="54" stroke="#E31E24" strokeWidth="4" strokeLinecap="round"/>
        <line x1="10" y1="65" x2="20" y2="65" stroke="#E31E24" strokeWidth="3" strokeLinecap="round"/>
        <path d="M30 50 A34 34 0 0 1 98 50" stroke="#E31E24" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <polygon points="55,18 98,50 55,82 40,50" fill="#2D8A2D"/>
        <rect x="42" y="52" width="46" height="20" rx="4" fill="#1a1a1a"/>
        <rect x="52" y="43" width="28" height="16" rx="3" fill="#1a1a1a"/>
        <rect x="54" y="45" width="22" height="12" rx="2" fill="#2D8A2D" opacity="0.7"/>
        <circle cx="52" cy="74" r="7" fill="#1a1a1a" stroke="#E31E24" strokeWidth="2"/>
        <circle cx="52" cy="74" r="3" fill="#E31E24"/>
        <circle cx="78" cy="74" r="7" fill="#1a1a1a" stroke="#E31E24" strokeWidth="2"/>
        <circle cx="78" cy="74" r="3" fill="#E31E24"/>
        <line x1="64" y1="30" x2="66" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="60" y1="30" x2="60" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="64" y1="30" x2="64" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="68" y1="30" x2="68" y2="37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M30 50 A34 34 0 0 0 98 50" stroke="#E31E24" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="6 3"/>
      </svg>
      <div className="leading-none select-none" style={{ fontSize: size * 0.42, fontWeight: 900, letterSpacing: '-0.01em' }}>
        <span style={{ color: '#E31E24' }}>EXPRESS</span>{' '}
        <span style={{ color: '#2D8A2D' }}>FOOD</span>
        <div style={{ fontSize: size * 0.18, color: '#888', fontWeight: 600, letterSpacing: '0.06em', marginTop: '1px' }}>
          LIVRAISON EXPRESS
        </div>
      </div>
    </div>
  );
}
