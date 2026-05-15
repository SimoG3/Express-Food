// src/components/CheckoutModal.tsx

import { useState } from "react";
import {
  X, ShoppingBag, User, Phone, Mail,
  CheckCircle, Loader2, AlertCircle, Lock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { generatePDF, generatePDFBlob } from "../utils/pdfGenerator";

function generateOrderRef(): string {
  return String(Math.floor(10000 + Math.random() * 89999));
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function CheckoutModal() {
  const { cart, checkoutOpen, setCheckoutOpen, clearCart, activeProClient, addGlobalOrder } = useApp();

  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [webhookError,setWebhookError]= useState<string | null>(null);

  if (!checkoutOpen) return null;

  const isPro = !!activeProClient;
  const orderTotal = cart.reduce((s, i) => s + i.effectivePrice * i.quantity, 0);
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitState("loading");
    setWebhookError(null);

    const orderRef = generateOrderRef();
    const basePdfOpts = {
      orderRef,
      clientName:    name.trim(),
      clientPhone:   phone.trim(),
      clientEmail:   email.trim() || undefined,
      isProClient:   isPro,
      proClientName: activeProClient?.name,
      items: cart.map(i => ({
        name: i.name, quantity: i.quantity,
        unitPrice: i.effectivePrice, totalPrice: i.effectivePrice * i.quantity,
      })),
      orderTotal,
    };

    // Both PDF blobs for Discord
    const pdfWithPrices    = generatePDFBlob({ ...basePdfOpts, withPrices: true });
    const pdfWithoutPrices = generatePDFBlob({ ...basePdfOpts, withPrices: false });

    const itemsText = cart.map(i =>
      `> **${i.name}** — ×${i.quantity} — ${(i.effectivePrice * i.quantity).toFixed(2)} €`
    ).join("\n");

    const discordEmbed = {
      embeds: [{
        title: `🛒 Nouvelle Commande — #${orderRef}`,
        color: isPro ? 0x2d8a2d : 0xe31e24,
        fields: [
          { name: "👤 Client",    value: name.trim(),         inline: true },
          { name: "📞 Téléphone", value: phone.trim(),        inline: true },
          { name: "📧 Email",     value: email.trim() || "—", inline: true },
          { name: isPro ? "⭐ Compte Pro" : "👤 Type client",
            value: isPro ? activeProClient!.name : "Client Standard", inline: true },
          { name: "🧾 Articles", value: itemsText, inline: false },
          { name: "💰 Total TTC", value: `**${orderTotal.toFixed(2)} €**`, inline: false },
          { name: "📎 Pièces jointes", value: "① Avec prix · ② Sans prix", inline: false },
        ],
        footer: { text: `Express Food • ${new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}` },
      }],
    };

    try {
      const form = new FormData();
      form.append("payload_json", JSON.stringify(discordEmbed));
      form.append("files[0]", pdfWithPrices,    `commande_EF-${orderRef}_avec-prix.pdf`);
      form.append("files[1]", pdfWithoutPrices, `commande_EF-${orderRef}_sans-prix.pdf`);
      const res = await fetch("/api/notify-multipart", { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitState("success");
      addGlobalOrder({
        orderId:      orderRef,
        date:         new Date().toISOString(),
        clientName:   name.trim(),
        clientPhone:  phone.trim(),
        clientEmail:  email.trim(),
        isProClient:  isPro,
        proClientId:  activeProClient?.id,
        proClientName: activeProClient?.name,
        items: cart.map(i => ({
          productId:  i.id,
          name:       i.name,
          unit:       i.unit,
          quantity:   i.quantity,
          unitPrice:  i.effectivePrice,
          total:      i.effectivePrice * i.quantity,
        })),
        orderTotal,
        status: 'confirmed',
      });
    } catch (err: any) {
      console.error("[Discord] failed:", err);
      setWebhookError(`Notification Discord échouée (${err?.message ?? "erreur réseau"}).`);
      setSubmitState("error");
    }

    // Client PDF: normal client gets WITH prices, pro WITHOUT prices
    generatePDF({ ...basePdfOpts, withPrices: !isPro });
    clearCart();
  }

  function handleClose() {
    setCheckoutOpen(false); setSubmitState("idle");
    setName(""); setPhone(""); setEmail(""); setWebhookError(null);
  }

  if (submitState === "success" || submitState === "error") {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: submitState === "success" ? "#2D8A2D22" : "#E31E2422" }}>
            {submitState === "success"
              ? <CheckCircle className="w-9 h-9" style={{ color: "#2D8A2D" }} />
              : <AlertCircle className="w-9 h-9" style={{ color: "#E31E24" }} />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {submitState === "success" ? "Commande confirmée !" : "Commande reçue"}
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            {isPro
              ? "Votre bon de commande (sans prix) a été téléchargé."
              : "Votre PDF avec le détail des prix a été téléchargé."}
          </p>
          {submitState === "error" && webhookError && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mt-2 mb-2">⚠️ {webhookError}</p>
          )}
          <button onClick={handleClose}
            className="mt-6 w-full py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#E31E24" }}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#E31E2415" }}>
              <ShoppingBag className="w-5 h-5" style={{ color: "#E31E24" }} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Finaliser la commande</h2>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50">
              Récapitulatif
            </div>
            <div className="divide-y divide-gray-50">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-400">× {item.quantity}</span>
                  </div>
                  {isPro ? (
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#2D8A2D" }}>
                      <Lock size={10} /> Pro
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">
                      {(item.effectivePrice * item.quantity).toFixed(2)} €
                    </span>
                  )}
                </div>
              ))}
            </div>
            {isPro ? (
              <div className="flex items-center gap-2 px-4 py-3 font-bold text-white rounded-b-xl"
                style={{ backgroundColor: "#2D8A2D" }}>
                <Lock size={14} /><span>Total confidentiel — Compte Pro</span>
              </div>
            ) : (
              <div className="flex justify-between items-center px-4 py-3 font-bold text-white rounded-b-xl"
                style={{ backgroundColor: "#E31E24" }}>
                <span>Total TTC</span><span>{orderTotal.toFixed(2)} €</span>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Vos coordonnées</p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Nom complet *" required value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" placeholder="Téléphone *" required value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="Email (optionnel)" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm" />
            </div>
          </div>

          {isPro && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#2D8A2D15", color: "#2D8A2D" }}>
              <CheckCircle className="w-4 h-4" />
              Compte Pro : {activeProClient!.name} — bon de commande sans prix.
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            {isPro
              ? "Un bon de commande sans prix sera téléchargé automatiquement."
              : "Votre PDF avec prix TTC sera téléchargé automatiquement."}
          </p>

          <button type="button" onClick={handleSubmit}
            disabled={submitState === "loading" || !name.trim() || !phone.trim()}
            className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: isPro ? "#2D8A2D" : "#E31E24" }}>
            {submitState === "loading"
              ? <><Loader2 className="w-4 h-4 animate-spin" />Traitement…</>
              : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </div>
  );
}