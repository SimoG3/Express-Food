// src/utils/webhookService.ts
// Sends a Discord webhook notification on every finalized order.
// Discord supports multipart/form-data: JSON payload_json + file attachment in one request.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  isProClient: boolean;
  proClientName?: string;
}

export interface WebhookPayload {
  orderRef: string;
  timestamp: string;
  client: ClientInfo;
  items: OrderItem[];
  orderTotal: number;
  currency: string;
}

// ─── Admin PDF (items + quantities only, NO prices) ───────────────────────────

export function generateAdminPdfBlob(payload: WebhookPayload): Blob {
  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  const red   = "#E31E24";
  const green = "#2D8A2D";
  const dark  = "#111111";
  const w     = doc.internal.pageSize.getWidth();

  // Header stripes
  doc.setFillColor(red);
  doc.rect(0, 0, w, 22, "F");
  doc.setFillColor(green);
  doc.rect(0, 22, w, 5, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Express Food — Bon de commande (Admin)", w / 2, 14, { align: "center" });

  // Order ref box
  doc.setFillColor("#F5F5F5");
  doc.roundedRect(14, 32, w - 28, 18, 3, 3, "F");
  doc.setTextColor(dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Référence : #EF-${payload.orderRef}`, 20, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#555555");
  doc.text(`Date : ${new Date(payload.timestamp).toLocaleString("fr-FR")}`, 20, 47);

  // Client block
  doc.setFontSize(10);
  doc.setTextColor(dark);
  doc.setFont("helvetica", "bold");
  doc.text("Client", 14, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#333333");
  doc.text(`Nom : ${payload.client.name}`, 14, 67);
  doc.text(`Téléphone : ${payload.client.phone}`, 14, 73);
  if (payload.client.email) doc.text(`Email : ${payload.client.email}`, 14, 79);
  if (payload.client.isProClient && payload.client.proClientName) {
    doc.setTextColor(green);
    doc.setFont("helvetica", "bold");
    doc.text(`Compte Pro : ${payload.client.proClientName}`, 14, 85);
  }

  // Items table — NO price columns
  doc.setTextColor(dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Articles commandés", 14, 96);

  autoTable(doc, {
    startY: 100,
    head: [["Article", "Quantité"]],
    body: payload.items.map((item) => [item.name, item.quantity.toString()]),
    headStyles: { fillColor: red, textColor: "#FFFFFF", fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: dark },
    alternateRowStyles: { fillColor: "#FAFAFA" },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 30, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setDrawColor(green);
  doc.setLineWidth(0.5);
  doc.line(14, finalY, w - 14, finalY);
  doc.setFontSize(8);
  doc.setTextColor("#888888");
  doc.setFont("helvetica", "normal");
  doc.text(
    "Document réservé à l'usage interne — Express Food",
    w / 2,
    finalY + 6,
    { align: "center" }
  );

  return doc.output("blob");
}

// ─── Discord embed builder ────────────────────────────────────────────────────

function buildDiscordPayload(payload: WebhookPayload): object {
  const itemLines = payload.items
    .map(
      (i) =>
        `• **${i.name}** × ${i.quantity} — ${i.totalPrice.toFixed(2)} ${payload.currency}`
    )
    .join("\n");

  const proLine =
    payload.client.isProClient && payload.client.proClientName
      ? `✅ **Compte Pro :** ${payload.client.proClientName}`
      : "👤 Client standard";

  return {
    username: "Express Food — Commandes",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/3724/3724788.png",
    embeds: [
      {
        title: `🛒 Nouvelle commande #EF-${payload.orderRef}`,
        color: 0x2d8a2d, // green
        timestamp: payload.timestamp,
        fields: [
          {
            name: "👤 Client",
            value: [
              `**Nom :** ${payload.client.name}`,
              `**Tél :** ${payload.client.phone}`,
              payload.client.email ? `**Email :** ${payload.client.email}` : null,
              proLine,
            ]
              .filter(Boolean)
              .join("\n"),
            inline: false,
          },
          {
            name: "🛍️ Articles",
            value: itemLines || "—",
            inline: false,
          },
          {
            name: "💶 Total",
            value: `**${payload.orderTotal.toFixed(2)} ${payload.currency}**`,
            inline: true,
          },
          {
            name: "📄 Bon admin",
            value: "Fichier joint ci-dessous (sans prix)",
            inline: true,
          },
        ],
        footer: { text: "Express Food · Système de commandes" },
      },
    ],
  };
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export async function dispatchOrderWebhook(
  payload: WebhookPayload,
  webhookUrl: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const pdfBlob        = generateAdminPdfBlob(payload);
    const discordPayload = buildDiscordPayload(payload);

    // Discord multipart: "payload_json" (embed data) + "files[0]" (PDF attachment)
    const form = new FormData();
    form.append("payload_json", JSON.stringify(discordPayload));
    form.append(
      "files[0]",
      pdfBlob,
      `admin_commande_EF-${payload.orderRef}.pdf`
    );

    const res = await fetch(webhookUrl, { method: "POST", body: form });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[Discord Webhook] error response:", res.status, text);
    }

    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    console.error("[Discord Webhook] dispatch failed:", err);
    return { ok: false, error: err?.message ?? "Unknown error" };
  }
}