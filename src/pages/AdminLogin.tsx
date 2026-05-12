import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COLOR, BRAND_NAME } from '../data/constants';
import { LogoLight } from '../components/Logo';

export default function AdminLogin() {
  const { login, navigate } = useApp();
  const [pw,      setPw]      = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [show,    setShow]    = useState(false);

  const handleLogin = () => {
    if (!pw.trim()) { setError('Veuillez entrer le mot de passe.'); return; }
    setLoading(true);
    setTimeout(() => {
      if (!login(pw)) { setError('Mot de passe incorrect.'); setPw(''); }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#f6f6f6' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <LogoLight size={44} />
        </div>

        <div className="bg-white border rounded-sm p-6 shadow-sm"
          style={{ borderColor: '#e5e5e5', borderTop: `4px solid ${COLOR.red}` }}>

          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-3"
              style={{ background: COLOR.dark }}>
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="font-black text-gray-800 text-lg">Administration</h1>
            <p className="text-xs text-gray-400 mt-1">{BRAND_NAME} — Accès réservé</p>
          </div>

          <div className="mb-4">
            <label htmlFor="admin-pw"
              className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input id="admin-pw" type={show ? 'text' : 'password'} value={pw}
                onChange={e => { setPw(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••••••••••"
                className="w-full border px-3 py-2.5 pr-20 text-sm rounded-sm focus:outline-none focus:ring-2"
                style={{ borderColor: error ? '#ef4444' : '#e5e5e5' }} />
              <button onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: COLOR.red }}>
                {show ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full text-white font-black py-2.5 rounded-sm text-sm mb-3"
            style={{ background: loading ? '#94a3b8' : COLOR.red }}>
            {loading ? 'Vérification…' : 'Se connecter'}
          </button>

          <button onClick={() => navigate('home')}
            className="w-full text-xs py-1 hover:text-gray-600" style={{ color:'#9ca3af' }}>
            ← Retour au site
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color:'#d1d5db' }}>
          Page non référencée dans la navigation.
        </p>
      </div>
    </div>
  );
}
