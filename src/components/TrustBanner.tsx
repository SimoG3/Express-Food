import { Zap, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { COLOR } from '../data/constants';

const ITEMS = [
  { icon: Zap,         title: 'Livraison Express',    subtitle: 'En 30 à 60 min',     detail: 'Commandez avant 14h, livré aujourd\'hui', accent: COLOR.red   },
  { icon: Truck,       title: 'Livraison à domicile', subtitle: 'Dès 2.99 €',          detail: 'Livraison standard sous 24–48h',           accent: COLOR.green },
  { icon: ShieldCheck, title: 'Paiement sécurisé',    subtitle: '3D Secure & SSL',     detail: 'Toutes cartes bancaires acceptées',         accent: COLOR.red   },
  { icon: Leaf,        title: 'Fraîcheur garantie',   subtitle: '100 % frais',          detail: 'Remboursé si non satisfait',               accent: COLOR.green },
] as const;

export default function TrustBanner() {
  return (
    <section aria-label="Nos engagements" className="border-t border-b"
      style={{ background: '#fff', borderColor: COLOR.border }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: COLOR.border }}>
          {ITEMS.map(({ icon: Icon, title, subtitle, detail, accent }) => (
            <div key={title} className="flex items-start gap-3 px-5 py-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center mt-0.5"
                style={{ background: accent }}>
                <Icon size={19} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-800 leading-tight">{title}</p>
                <p className="text-xs font-bold" style={{ color: accent }}>{subtitle}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
