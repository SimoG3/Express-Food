// src/utils/pdfGenerator.ts
// Generates branded Express Food PDFs.
// Pass withPrices: true  → includes unit prices + total (client-facing / admin)
// Pass withPrices: false → items + quantity only, NO prices (admin no-price copy)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfOptions {
  orderRef: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  isProClient: boolean;
  proClientName?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  orderTotal: number;
  /** true = show prices (default); false = items + qty only */
  withPrices?: boolean;
}

/** Generates and auto-downloads a PDF. */
export function generatePDF(opts: PdfOptions): void {
  buildDoc(opts).save(`commande_EF-${opts.orderRef}.pdf`);
}

/** Generates and returns the PDF as a Blob (for webhook attachment). */
export function generatePDFBlob(opts: PdfOptions): Blob {
  return buildDoc(opts).output("blob");
}

// ─── Internal builder ────────────────────────────────────────────────────────

function buildDoc(opts: PdfOptions): jsPDF {
  const showPrices = opts.withPrices !== false; // default true

  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  const red   = "#E31E24";
  const green = "#2D8A2D";
  const dark  = "#111111";
  const w     = doc.internal.pageSize.getWidth();

  // ── Header stripes ─────────────────────────────────────────────────────────
  doc.setFillColor(red);
  doc.rect(0, 0, w, 22, "F");
  doc.setFillColor(green);
  doc.rect(0, 22, w, 5, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const headerTitle = showPrices
    ? "Express Food — Bon de commande"
    : "Express Food — Bon de commande (Admin — sans prix)";
  doc.text(headerTitle, w / 2, 14, { align: "center" });

  // ── Order ref box ──────────────────────────────────────────────────────────
  doc.setFillColor("#F5F5F5");
  doc.roundedRect(14, 32, w - 28, 20, 3, 3, "F");
  doc.setTextColor(dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Commande #EF-${opts.orderRef}`, 20, 41);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#555555");
  doc.text(`Émis le : ${new Date().toLocaleString("fr-FR")}`, 20, 48);

  // ── Client details ─────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(dark);
  doc.setFont("helvetica", "bold");
  doc.text("Informations client", 14, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#333333");
  doc.text(`Nom : ${opts.clientName}`, 14, 69);
  doc.text(`Téléphone : ${opts.clientPhone}`, 14, 75);
  if (opts.clientEmail) doc.text(`Email : ${opts.clientEmail}`, 14, 81);

  if (opts.isProClient && opts.proClientName) {
    const badgeY = opts.clientEmail ? 90 : 84;
    doc.setFillColor(green);
    doc.roundedRect(14, badgeY - 5, 60, 8, 2, 2, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`✓ Compte Pro : ${opts.proClientName}`, 17, badgeY);
  }

  // ── Items table ────────────────────────────────────────────────────────────
  const tableStartY = opts.isProClient && opts.proClientName
    ? (opts.clientEmail ? 102 : 96)
    : (opts.clientEmail ? 90 : 84);

  doc.setTextColor(dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Détail de la commande", 14, tableStartY);

  if (showPrices) {
    // With prices: Article | Qté | Prix unit. | Total
    autoTable(doc, {
      startY: tableStartY + 4,
      head: [["Article", "Qté", "Prix unit.", "Total"]],
      body: opts.items.map((item) => [
        item.name,
        item.quantity.toString(),
        `${item.unitPrice.toFixed(2)} €`,
        `${item.totalPrice.toFixed(2)} €`,
      ]),
      headStyles: { fillColor: red, textColor: "#FFFFFF", fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: dark },
      alternateRowStyles: { fillColor: "#FAFAFA" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      foot: [[
        { content: "TOTAL", colSpan: 3, styles: { halign: "right", fontStyle: "bold", fillColor: red, textColor: "#FFFFFF" } },
        { content: `${opts.orderTotal.toFixed(2)} €`, styles: { halign: "right", fontStyle: "bold", fillColor: red, textColor: "#FFFFFF" } },
      ]],
      margin: { left: 14, right: 14 },
    });
  } else {
    // Without prices: Article | Quantité only
    autoTable(doc, {
      startY: tableStartY + 4,
      head: [["Article", "Quantité"]],
      body: opts.items.map((item) => [item.name, item.quantity.toString()]),
      headStyles: { fillColor: red, textColor: "#FFFFFF", fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: dark },
      alternateRowStyles: { fillColor: "#FAFAFA" },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 30, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setDrawColor(green);
  doc.setLineWidth(0.5);
  doc.line(14, finalY, w - 14, finalY);
  doc.setFontSize(8);
  doc.setTextColor("#888888");
  doc.setFont("helvetica", "normal");
  const footerText = showPrices
    ? "Merci pour votre commande — Express Food · contact@expressfood.ma"
    : "Document réservé à l'usage interne — Express Food";
  doc.text(footerText, w / 2, finalY + 6, { align: "center" });

  return doc;
}