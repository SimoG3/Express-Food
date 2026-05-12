import { useState } from 'react';
import { X, FileText, CheckCircle, AlertCircle, Phone, Mail, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLOR, WHATSAPP_ADMIN, BRAND_NAME } from '../data/constants';
import { generateOrderPDF } from '../utils/pdfGenerator';
import type { OrderRecord, OrderLineItem } from '../types';

interface FormState { name: string; phone: string; email: string; }
interface FormErrors { name?: string; phone?: string; email?: string; }

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim())                                   e.name  = 'Nom requis';
  if (!/^\+?[\d\s\-().]{7,}$/.test(f.phone))           e.phone = 'Numéro invalide';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))     e.email = 'Email invalide';
  return e;
}

function Field({ icon: Icon, label, id, type='text', value, onChange, error, placeholder }:
  { icon: React.ElementType; label: string; id: string; type?: string;
    value: string; onChange: (v: string) => void; error?: string; placeholder: string }) {
  return (
    <div>
      <label htmlFor={id}
        className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border pl-9 pr-3 py-2.5 text-sm rounded-sm focus:outline-none focus:ring-2"
          style={{ borderColor: error ? '#ef4444' : COLOR.border,
                   '--tw-ring-color': COLOR.red } as React.CSSProperties} />
      </div>
      {error && <div className="flex items-center gap-1 mt-1">
        <AlertCircle size={11} className="text-red-400" />
        <p className="text-red-500 text-xs">{error}</p>
      </div>}
    </div>
  );
}

export default function CheckoutModal() {
  const { cart, cartTotal, clearCart, checkoutOpen, setCheckoutOpen,
          activeProClient, recordOrder } = useApp();

  const [form,   setForm]   = useState<FormState>({ name:'', phone:'', email:'' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [done,   setDone]   = useState(false);
  const [orderId,setOrderId]= useState('');

  if (!checkoutOpen) return null;

  const set = (k: keyof FormState, v: string) => {
    setForm(f => ({...f,[k]:v}));
    if (errors[k]) setErrors(e => ({...e,[k]:undefined}));
  };

  const handleValidate = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const oid     = `EF-${Date.now().toString(36).toUpperCase()}`;
    const now     = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
    setOrderId(oid);

    const items: OrderLineItem[] = cart.map(item => ({
      productId: item.id, name: item.name, unit: item.unit,
      quantity:  item.quantity, unitPrice: item.effectivePrice,
      total:     parseFloat((item.effectivePrice * item.quantity).toFixed(2)),
    }));
    const subtotal = parseFloat(items.reduce((s,i) => s + i.total, 0).toFixed(2));

    // 1. Generate & download PDF
    generateOrderPDF({
      orderId: oid, clientName: form.name, phone: form.phone,
      email: form.email, date: dateStr, items, subtotal,
      isProClient: !!activeProClient, proClientName: activeProClient?.name,
    });

    // 2. Record in pro history
    const order: OrderRecord = {
      orderId: oid, date: now.toISOString(),
      clientName: form.name, phone: form.phone, email: form.email, items, subtotal,
    };
    if (activeProClient) recordOrder(activeProClient.id, order);

    // 3. WhatsApp admin notification
    const itemsText = items.map(i => `• ${i.name} ×${i.quantity}`).join('\n');
    const msg = encodeURIComponent(
      `🚗 *Nouvelle Commande — ${BRAND_NAME}*\n\n` +
      `📋 Référence : ${oid}\n` +
      `👤 Client : ${form.name}${activeProClient ? ` (${activeProClient.name})` : ''}\n` +
      `📞 Tél : ${form.phone}\n` +
      `📧 Email : ${form.email}\n\n` +
      `📦 Articles :\n${itemsText}\n\n` +
      `💰 *Total : ${subtotal.toFixed(2)} €*\n\n` +
      `📄 PDF téléchargé par le client.`
    );
    window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${msg}`, '_blank');

    clearCart();
    setDone(true);
  };

  const handleClose = () => {
    setCheckoutOpen(false); setDone(false);
    setForm({ name:'', phone:'', email:'' }); setErrors({});
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-60" onClick={handleClose} />
      <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-lg bg-white rounded-sm shadow-2xl"
        style={{ transform:'translate(-50%,-50%)', maxHeight:'90vh', overflowY:'auto',
                 borderTop:`4px solid ${COLOR.red}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: COLOR.border }}>
          <div className="flex items-center gap-2">
            <FileText size={17} style={{ color: COLOR.red }} />
            <span className="font-black text-gray-800">Valider la commande</span>
          </div>
          <button onClick={handleClose}><X size={17} className="text-gray-400" /></button>
        </div>

        <div className="p-5">
          {done ? (
            /* Success */
            <div className="text-center py-6">
              <CheckCircle size={52} className="mx-auto mb-4 text-green-500" />
              <h3 className="font-black text-xl text-gray-800 mb-2">Commande confirmée !</h3>
              <p className="text-gray-500 text-sm mb-1">
                Référence : <strong style={{ color: COLOR.red }}>#{orderId}</strong>
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Votre PDF a été téléchargé et notre équipe a été notifiée.
              </p>
              <div className="rounded-sm p-3 text-xs text-gray-500 mb-5"
                style={{ background: '#f6f6f6', borderLeft: `3px solid ${COLOR.green}` }}>
                📄 Bon de commande enregistré dans vos téléchargements<br />
                💬 Notre équipe a reçu votre commande via WhatsApp
              </div>
              <button onClick={handleClose}
                className="text-white font-black px-8 py-2.5 rounded-sm text-sm"
                style={{ background: COLOR.red }}>
                Retour à la boutique
              </button>
            </div>
          ) : (
            <>
              {/* Pro notice */}
              {activeProClient && (
                <div className="flex items-center gap-2 p-3 rounded-sm mb-4 text-sm"
                  style={{ background:'#f0faf0', borderLeft:`3px solid ${COLOR.green}` }}>
                  <span style={{ color: COLOR.green }}>★</span>
                  <span className="font-semibold" style={{ color: COLOR.green }}>
                    Tarifs Pro actifs — {activeProClient.name}
                  </span>
                </div>
              )}

              {/* Order summary */}
              <div className="border rounded-sm mb-4 overflow-hidden"
                style={{ borderColor: COLOR.border }}>
                <div className="px-3 py-2 text-xs font-black text-white uppercase tracking-wider"
                  style={{ background: COLOR.dark }}>
                  Récapitulatif — {cart.length} article{cart.length !== 1 ? 's' : ''}
                </div>
                <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
                  {cart.map(item => (
                    <div key={item.id}
                      className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-gray-700 flex-1 min-w-0 truncate">
                        {item.name} <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      <span className="font-black ml-3 flex-shrink-0" style={{ color: COLOR.red }}>
                        {(item.effectivePrice * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center px-3 py-2.5 font-black text-sm"
                  style={{ background: '#f6f6f6' }}>
                  <span>Total</span>
                  <span className="text-lg" style={{ color: COLOR.red }}>
                    {cartTotal.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4 mb-5">
                <Field icon={User}  label="Nom complet *"         id="co-name"  value={form.name}  onChange={v => set('name',v)}  error={errors.name}  placeholder="Jean Martin" />
                <Field icon={Phone} label="Numéro de téléphone *" id="co-phone" type="tel" value={form.phone} onChange={v => set('phone',v)} error={errors.phone} placeholder="+33 7 45 46 18 70" />
                <Field icon={Mail}  label="Adresse e-mail *"      id="co-email" type="email" value={form.email} onChange={v => set('email',v)} error={errors.email} placeholder="vous@email.com" />
              </div>

              <div className="text-xs text-gray-400 mb-4 p-3 rounded-sm" style={{ background:'#f6f6f6' }}>
                En validant, un <strong>PDF sera téléchargé</strong> automatiquement et une
                notification sera envoyée à notre équipe.
              </div>

              <button onClick={handleValidate} disabled={cart.length === 0}
                className="w-full text-white font-black py-3 rounded-sm text-sm"
                style={{ background: cart.length === 0 ? '#94a3b8' : COLOR.red }}>
                📄 Valider et télécharger le bon de commande →
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
