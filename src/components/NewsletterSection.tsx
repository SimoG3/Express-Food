import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { COLOR, BRAND_NAME } from '../data/constants';

export default function NewsletterSection() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const isValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSubmit = () => {
    if (!isValid(email)) { setError('Adresse e-mail invalide.'); return; }
    setError(''); setSubmitted(true); setEmail('');
  };

  return (
    <section className="py-10 px-4 border-t border-b"
      style={{ background:'white', borderColor: COLOR.border }}>
      <div className="max-w-2xl mx-auto text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm mb-4"
          style={{ background: COLOR.dark }}>
          <Mail size={22} style={{ color: COLOR.red }} />
        </div>

        <h2 className="font-black text-2xl text-gray-800 mb-1">
          Rejoignez le Club {BRAND_NAME}
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Inscrivez-vous et économisez&nbsp;
          <strong style={{ color: COLOR.red }}>10 € sur votre première commande.</strong>
          <br />Offres exclusives, promotions flash et nouveautés dans votre boîte mail.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={44} style={{ color: COLOR.green }} />
            <p className="font-black text-gray-700 text-lg">Merci — votre coupon arrive !</p>
            <p className="text-sm text-gray-400">Pensez à vérifier vos spams.</p>
            <button onClick={() => setSubmitted(false)}
              className="text-xs underline mt-1" style={{ color:'#9ca3af' }}>
              Utiliser une autre adresse
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="votre@email.com"
                className="flex-1 border px-4 py-2.5 text-sm rounded-sm focus:outline-none"
                style={{ borderColor: error ? '#ef4444' : COLOR.border }} />
              <button onClick={handleSubmit}
                className="text-white font-black px-6 py-2.5 rounded-sm text-sm flex-shrink-0"
                style={{ background: COLOR.red }}>
                S'abonner
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5">
                <AlertCircle size={13} className="text-red-400" />
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}
            <p className="text-xs text-gray-300 mt-1">
              Désinscription possible à tout moment. Politique de confidentialité.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
