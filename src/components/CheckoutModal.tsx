// src/components/CheckoutModal.tsx

import { useState } from "react";
import {
  X, ShoppingBag, User, Phone, Mail,
  CheckCircle, Loader2, AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { generatePDF, generatePDFBlob } from "../utils/pdfGenerator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderRef(): string {
  return String(Math.floor(10000 + Math.random() * 89999));
}

type SubmitState = "idle" | "loading" | "success" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutModal() {
  const {
    cart,
    checkoutOpen,
    setCheckoutOpen,
    clearCart,
    activeProClient,
  } = useApp();

  const [name,         setName]         = useState("");
  const [phone,        setPhone]        = useState("");
  const [email,        setEmail]        = useState("");
  const [submitState,  setSubmitState]  = useState<SubmitState>("idle");
  const [webhookError, setWebhookError] = useState<string | null>(null);

  if (!checkoutOpen) return null;

  const orderTotal = cart.reduce(
    (sum, item) => sum + item.effectivePrice * item.quantity,
    0
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSubmitState("loading");
    setWebhookError(null);

    const orderRef = generateOrderRef();

    // Shared PDF options (prices always visible for the with-prices copy)
    const basePdfOpts = {
      orderRef,
      clientName:    name.trim(),
      clientPhone:   phone.trim(),
      clientEmail:   email.trim() || undefined,
      isProClient:   !!activeProClient,
      proClientName: activeProClient?.name,
      items: cart.map((item) => ({
        name:       item.name,
        quantity:   item.quantity,
        unitPrice:  item.effectivePrice,
        totalPrice: item.effectivePrice * item.quantity,
      })),
      orderTotal,
    };

    // 1. Build both PDF blobs for Discord (always with + without prices)
    const pdfWithPrices    = generatePDFBlob({ ...basePdfOpts, withPrices: true });
    const pdfWithoutPrices = generatePDFBlob({ ...basePdfOpts, withPrices: false });

    // 2. Build Discord embed
    const itemsText = cart
      .map(
        (item) =>
          `> **${item.name}** — ×${item.quantity} — ${(item.effectivePrice * item.quantity).toFixed(2)} €`
      )
      .join("\n");

    const discordEmbed = {
      embeds: [
        {
          title: `🛒 Nouvelle Commande — #${orderRef}`,
          color: 0xe31e24,
          fields: [
            { name: "👤 Client",    value: name.trim(),         inline: true },
            { name: "📞 Téléphone", value: phone.trim(),        inline: true },
            { name: "📧 Email",     value: email.trim() || "—", inline: true },
            {
              name:  activeProClient ? "⭐ Compte Pro" : "👤 Type client",
              value: activeProClient ? activeProClient.name : "Client Standard",
              inline: true,
            },
            { name: "🧾 Articles commandés", value: itemsText,                        inline: false },
            { name: "💰 Total",              value: `**${orderTotal.toFixed(2)} €**`, inline: false },
            { name: "📎 Pièces jointes",     value: "Bon avec prix (file 1) · Bon sans prix (file 2)", inline: false },
          ],
          footer: {
            text: `Express Food • ${new Date().toLocaleDateString("fr-FR", {
              day: "2-digit", month: "long", year: "numeric",
            })}`,
          },
        },
      ],
    };

    // 3. Send to Discord via multipart (embed + two PDF attachments)
    try {
      const form = new FormData();
      form.append("payload_json", JSON.stringify(discordEmbed));
      form.append(
        "files[0]",
        pdfWithPrices,
        `commande_EF-${orderRef}_avec-prix.pdf`
      );
      form.append(
        "files[1]",
        pdfWithoutPrices,
        `commande_EF-${orderRef}_sans-prix.pdf`
      );

      const res = await fetch("/api/notify-multipart", {
        method: "POST",
        body:   form,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSubmitState("success");
    } catch (err: any) {
      console.error("[Discord] notification failed:", err);
      setWebhookError(
        `Notification Discord échouée (${err?.message ?? "erreur réseau"}). La commande a bien été traitée côté client.`
      );
      setSubmitState("error");
    }

    // 4. Download the right PDF for the client:
    //    - Normal client → with prices
    //    - Pro client    → without prices
    generatePDF({ ...basePdfOpts, withPrices: !activeProClient });

    clearCart();
  }

  function handleClose() {
    setCheckoutOpen(false);
    setSubmitState("idle");
    setName("");
    setPhone("");
    setEmail("");
    setWebhookError(null);
  }

  // ── Success / error screen ─────────────────────────────────────────────────
  if (submitState === "success" || submitState === "error") {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor:
                submitState === "success" ? "#2D8A2D22" : "#E31E2422",
            }}
          >
            {submitState === "success" ? (
              <CheckCircle className="w-9 h-9" style={{ color: "#2D8A2D" }} />
            ) : (
              <AlertCircle className="w-9 h-9" style={{ color: "#E31E24" }} />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {submitState === "success" ? "Commande confirmée !" : "Commande reçue"}
          </h2>

          <p className="text-gray-500 text-sm mb-2">
            Votre PDF a été téléchargé. Notre équipe traitera votre commande dans les
            meilleurs délais.
          </p>

          {submitState === "error" && webhookError && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mt-2 mb-2">
              ⚠️ {webhookError}
            </p>
          )}

          <button
            onClick={handleClose}
            className="mt-6 w-full py-3 rounded-xl font-semibold text-white transition-all"
            style={{ backgroundColor: "#E31E24" }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // ── Main modal ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#E31E2415" }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: "#E31E24" }} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Finaliser la commande
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Order summary */}
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50">
              Récapitulatif
            </div>
            <div className="divide-y divide-gray-50">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {item.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {(item.effectivePrice * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex justify-between items-center px-4 py-3 font-bold text-white rounded-b-xl"
              style={{ backgroundColor: "#E31E24" }}
            >
              <span>Total</span>
              <span>{orderTotal.toFixed(2)} €</span>
            </div>
          </div>

          {/* Client form */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Vos coordonnées</p>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom complet *"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-sm"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Téléphone *"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-sm"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-sm"
              />
            </div>
          </div>

          {/* Pro badge */}
          {activeProClient && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#2D8A2D15", color: "#2D8A2D" }}
            >
              <CheckCircle className="w-4 h-4" />
              Compte Pro actif : {activeProClient.name} — votre PDF ne contiendra pas les prix.
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Votre PDF de commande sera téléchargé automatiquement. Notre équipe
            recevra une notification instantanée.
          </p>

          <button
            type="submit"
            disabled={submitState === "loading"}
            className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: "#E31E24" }}
          >
            {submitState === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement en cours…
              </>
            ) : (
              "Confirmer la commande"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}