/**
 * Express Food — PDF Order Generator
 * Deps: jspdf  jspdf-autotable  (npm install jspdf jspdf-autotable)
 */

// Dynamic imports so Vite can tree-shake when unused
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PdfOrderData } from '../types';

// ── Brand colours (as RGB tuples for jsPDF) ────────────────────────────────
const RED:   [number, number, number] = [227, 30,  36 ];
const GREEN: [number, number, number] = [45,  138, 45 ];
const DARK:  [number, number, number] = [17,  17,  17 ];
const GRAY:  [number, number, number] = [246, 246, 246];
const WHITE: [number, number, number] = [255, 255, 255];
const MID:   [number, number, number] = [120, 120, 120];

export function generateOrderPDF(order: PdfOrderData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;

  // ── Dark header ──────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 36, 'F');

  // Left red stripe
  doc.setFillColor(...RED);
  doc.rect(0, 0, 5, 36, 'F');
  // Right green stripe
  doc.setFillColor(...GREEN);
  doc.rect(W - 5, 0, 5, 36, 'F');

  // Brand wordmark
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...RED);
  doc.text('EXPRESS', 14, 16);
  const expressW = doc.getTextWidth('EXPRESS ');
  doc.setTextColor(...GREEN);
  doc.text('FOOD', 14 + expressW, 16);

  // Tagline
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text('Livraison Express à domicile', 14, 24);

  // Top-right contact block
  doc.setFontSize(8.5);
  doc.setTextColor(160, 160, 160);
  doc.text(`Date : ${order.date}`, W - 14, 13, { align: 'right' });
  doc.text('+33 7 45 46 18 70', W - 14, 20, { align: 'right' });
  doc.text('contact@expressfood.fr', W - 14, 27, { align: 'right' });

  // Dual-colour divider bar
  doc.setFillColor(...RED);
  doc.rect(0, 36, W / 2, 3, 'F');
  doc.setFillColor(...GREEN);
  doc.rect(W / 2, 36, W / 2, 3, 'F');

  // ── Order ref box (top-right) ────────────────────────────────────────────
  doc.setFillColor(...GRAY);
  doc.rect(132, 44, 64, 28, 'F');
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.rect(132, 44, 64, 28);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MID);
  doc.text('N° DE COMMANDE', 135, 51);

  doc.setFontSize(15);
  doc.setTextColor(...RED);
  doc.text(`#${order.orderId}`, 135, 62);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID);
  doc.text('Statut : En attente', 135, 69);

  // ── Client block ─────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Informations Client', 14, 52);

  const fields: [string, string][] = [
    ['Nom',    order.clientName],
    ['Tél',    order.phone],
    ['Email',  order.email],
  ];
  if (order.isProClient && order.proClientName)
    fields.push(['Compte Pro', order.proClientName]);

  doc.setFontSize(10);
  fields.forEach(([label, val], i) => {
    const y = 60 + i * 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MID);
    doc.text(`${label} :`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(val, 38, y);
  });

  // Pro badge
  if (order.isProClient) {
    const badgeY = 60 + fields.length * 7 + 2;
    doc.setFillColor(...GREEN);
    doc.roundedRect(14, badgeY, 32, 6.5, 1, 1, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('★  CLIENT PRO', 15.8, badgeY + 4.5);
  }

  // ── Items table ──────────────────────────────────────────────────────────
  const tableY = order.isProClient
    ? 60 + fields.length * 7 + 14
    : 60 + fields.length * 7 + 6;

  autoTable(doc, {
    startY: tableY,
    head:   [['Produit', 'Unité', 'Qté', 'Prix Unit.', 'Total HT']],
    body:   order.items.map(item => [
      item.name,
      item.unit,
      String(item.quantity),
      `${item.unitPrice.toFixed(2)} €`,
      `${item.total.toFixed(2)} €`,
    ]),
    foot: [['', '', '', 'TOTAL', `${order.subtotal.toFixed(2)} €`]],

    headStyles: {
      fillColor:  DARK,
      textColor:  WHITE,
      fontStyle:  'bold',
      fontSize:   10,
    },
    footStyles: {
      fillColor:  RED,
      textColor:  WHITE,
      fontStyle:  'bold',
      fontSize:   11,
    },
    alternateRowStyles: { fillColor: GRAY },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 24 },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 30, halign: 'right'  },
      4: { cellWidth: 30, halign: 'right'  },
    },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },

    // Red accent stripe on head row left edge
    didDrawCell(data) {
      if (data.section === 'head' && data.column.index === 0) {
        doc.setFillColor(...RED);
        doc.rect(data.cell.x, data.cell.y, 2, data.cell.height, 'F');
      }
    },
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Green rule
  doc.setFillColor(...GREEN);
  doc.rect(14, finalY, 182, 0.8, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID);
  doc.text(
    'Merci pour votre commande. Notre équipe vous contactera pour confirmer la livraison.',
    14, finalY + 7,
  );
  doc.text(
    'Express Food · contact@expressfood.fr · +33 7 45 46 18 70',
    14, finalY + 14,
  );

  // Page number right-aligned
  doc.setTextColor(...RED);
  doc.setFontSize(8);
  doc.text('Page 1 / 1', W - 14, finalY + 14, { align: 'right' });

  // ── Trigger download ─────────────────────────────────────────────────────
  doc.save(`commande_${order.orderId}.pdf`);
}
