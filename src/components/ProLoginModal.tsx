import { useState } from 'react';
import { X, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLOR, BRAND_NAME } from '../data/constants';

export default function ProLoginModal() {
  const { proLoginOpen, setProLoginOpen, loginProClient, activeProClient, logoutProClient } = useApp();
  const [code,  setCode]  = useState('');
  const [error, setError] = useState('');

  if (!proLoginOpen) return null;

  const handleSubmit = () => {
    if (code.trim().length !== 6) { setError('Le code doit comporter 6 chiffres.'); return; }
    if (!loginProClient(code.trim())) {
      setError('Code invalide. Contactez votre commercial.'); setCode('');
    } else { setCode(''); setError(''); }
  };

  const close = () => { setProLoginOpen(false); setCode(''); setError(''); };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-60" onClick={close} />
      <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm bg-white rounded-sm shadow-2xl"
        style={{ transform:'translate(-50%,-50%)', borderTop:`4px solid ${COLOR.red}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: COLOR.border }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ background: COLOR.dark }}>
              <Building2 size={16} style={{ color: COLOR.red }} />
            </div>
            <div>
              <p className="font-black text-gray-800 text-sm leading-none">Accès Professionnel</p>
              <p className="text-xs text-gray-400 mt-0.5">{BRAND_NAME} — Espace B2B</p>
            </div>
          </div>
          <button onClick={close} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-5">
          {activeProClient ? (
            /* Already logged in */
            <div>
              <div className="flex items-center gap-3 p-3 rounded-sm mb-4"
                style={{ background:'#f0faf0', border:`1px solid ${COLOR.green}30` }}>
                <ShieldCheck size={20} style={{ color: COLOR.green }} />
                <div>
                  <p className="font-black text-sm" style={{ color: COLOR.green }}>Connecté :</p>
                  <p className="text-sm text-gray-700 font-semibold">{activeProClient.name}</p>
                  {activeProClient.company &&
                    <p className="text-xs text-gray-500">{activeProClient.company}</p>}
                </div>
              </div>
              <button onClick={() => { logoutProClient(); setProLoginOpen(false); }}
                className="w-full border text-sm font-bold py-2.5 rounded-sm"
                style={{ borderColor: '#fca5a5', color:'#ef4444' }}>
                Se déconnecter du compte Pro
              </button>
            </div>
          ) : (
            /* Login form */
            <div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Entrez votre <strong>code d'accès à 6 chiffres</strong> pour accéder
                à vos tarifs professionnels et fonctionnalités dédiées.
              </p>

              <div className="mb-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1.5">
                  Code d'Accès Pro
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="_ _ _ _ _ _"
                  className="w-full border px-4 py-3 text-2xl font-black tracking-widest text-center
                             rounded-sm focus:outline-none"
                  style={{ borderColor: error ? '#ef4444' : COLOR.border,
                           color: COLOR.red, letterSpacing: '0.4em' }}
                />
                {error && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                    <p className="text-red-500 text-xs">{error}</p>
                  </div>
                )}
              </div>

              <button onClick={handleSubmit}
                className="w-full text-white font-black py-2.5 rounded-sm text-sm mb-3"
                style={{ background: code.length === 6 ? COLOR.red : '#94a3b8' }}>
                Accéder à mon espace Pro
              </button>

              <p className="text-xs text-gray-400 text-center">
                Code fourni par votre commercial {BRAND_NAME}.&nbsp;
                <button className="underline" style={{ color: COLOR.green }}>
                  Contactez-nous
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
