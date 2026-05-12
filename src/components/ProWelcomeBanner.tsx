import { Building2, LogOut, Clock, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLOR } from '../data/constants';

export default function ProWelcomeBanner() {
  const { activeProClient, logoutProClient } = useApp();
  if (!activeProClient) return null;

  const overrideCount = Object.keys(activeProClient.priceOverrides).length;
  const orderCount    = activeProClient.purchaseHistory.length;

  return (
    <div style={{ background: COLOR.dark, borderBottom: `2px solid ${COLOR.green}` }}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">

        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{ background: COLOR.green }}>
            <Building2 size={15} className="text-white" />
          </div>
          <div>
            <div className="text-white font-black text-sm leading-none">
              Bienvenue, {activeProClient.name}
            </div>
            {activeProClient.company && (
              <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                {activeProClient.company}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9ca3af' }}>
            <Tag size={12} style={{ color: COLOR.green }} />
            <span><strong className="text-white">{overrideCount}</strong> tarifs Pro</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9ca3af' }}>
            <Clock size={12} style={{ color: COLOR.red }} />
            <span>
              <strong className="text-white">{orderCount}</strong>
              {' '}commande{orderCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logoutProClient}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm text-white"
          style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)' }}>
          <LogOut size={12} /> Déconnexion Pro
        </button>
      </div>
    </div>
  );
}
