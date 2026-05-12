import { useApp } from '../context/AppContext';
import { COLOR } from '../data/constants';
import Logo from './Logo';

const COLS = [
  { title:'Express Food',     links:['Comment ça marche ?','Nos engagements','Avis clients','Blog & Recettes'] },
  { title:'Mon Compte',       links:['Se connecter','Créer un compte','Mes commandes','Mes avantages'] },
  { title:'Aide & Contact',   links:['FAQ','Service client','Livraison & retours','Réclamations'] },
  { title:'Informations',     links:['Mentions légales','CGU & CGV','Confidentialité','Cookies'] },
];

export default function Footer() {
  const { navigate, setProLoginOpen } = useApp();

  return (
    <footer style={{ background: COLOR.dark }}>
      {/* Red / green divider */}
      <div className="flex h-1">
        <div className="flex-1" style={{ background: COLOR.red }} />
        <div className="flex-1" style={{ background: COLOR.green }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Top: logo + tagline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6"
          style={{ borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          <Logo size={42} />
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
              Livraison Express partout en France
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="font-black text-sm mb-3 uppercase tracking-wider"
                style={{ color: col.title === 'Express Food' ? COLOR.red : COLOR.green }}>
                {col.title}
              </h4>
              {col.links.map(l => (
                <button key={l} className="block text-sm mb-2 text-left w-full hover:text-white"
                  style={{ color:'#6b7280' }}>
                  {l}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Pro access CTA */}
        <div className="rounded-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)' }}>
          <div>
            <p className="font-black text-white text-sm">Vous êtes un professionnel ?</p>
            <p className="text-xs mt-0.5" style={{ color:'#6b7280' }}>
              Accédez à vos tarifs exclusifs B2B et passez vos commandes.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setProLoginOpen(true)}
              className="text-white font-black px-5 py-2 rounded-sm text-sm"
              style={{ background: COLOR.red }}>
              Accès Pro →
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4"
          style={{ borderTop:'1px solid rgba(255,255,255,.06)' }}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <span className="font-black text-white">EXPRESS</span>
            <span className="font-black" style={{ color: COLOR.green }}>FOOD</span>
            <span className="text-xs" style={{ color:'#4b5563' }}>
              © {new Date().getFullYear()} — Livraison Express
            </span>
          </div>
          <div className="flex gap-5 text-xs flex-wrap justify-center" style={{ color:'#4b5563' }}>
            <span>🔒 SSL Sécurisé</span>
            <span>🚗 Livraison Express</span>
            <span>🌿 Fraîcheur garantie</span>
            <span>↩️ Retours 30 j</span>
          </div>
        </div>
      </div>
    </footer>
  );
}