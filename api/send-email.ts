import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    isPro,
    clientName,
    clientEmail,
    proClientName,
    proClientEmail,
    orderRef,
    items,
    orderTotal,
  } = req.body;

  const adminEmail = isPro
    ? process.env.ADMIN_PRO_EMAIL!
    : process.env.ADMIN_NORMAL_EMAIL!;

  const itemsHtml = items.map((i: any) =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      ${!isPro ? `<td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${i.unitPrice.toFixed(2)} €</td>
      <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${i.total.toFixed(2)} €</td>` : ''}
    </tr>`
  ).join('');

  const tableHeaders = isPro
    ? `<th style="text-align:left;padding:8px 12px;background:#111;color:white">Article</th>
       <th style="text-align:center;padding:8px 12px;background:#111;color:white">Qté</th>`
    : `<th style="text-align:left;padding:8px 12px;background:#111;color:white">Article</th>
       <th style="text-align:center;padding:8px 12px;background:#111;color:white">Qté</th>
       <th style="text-align:right;padding:8px 12px;background:#111;color:white">Prix unit.</th>
       <th style="text-align:right;padding:8px 12px;background:#111;color:white">Total</th>`;

  const emailHtml = (recipientName: string, showTotal: boolean) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#111;padding:24px;text-align:center">
        <span style="color:#E31E24;font-weight:900;font-size:22px">EXPRESS </span>
        <span style="color:#2D8A2D;font-weight:900;font-size:22px">FOOD</span>
      </div>
      <div style="background:#E31E24;height:4px"></div>
      <div style="padding:24px;background:#fff">
        <h2 style="color:#111;margin-top:0">Nouvelle commande #EF-${orderRef}</h2>
        <p style="color:#555">Bonjour ${recipientName},</p>
        <p style="color:#555">
          ${isPro
            ? `Une nouvelle commande a été passée par le compte Pro <strong>${proClientName}</strong>.`
            : `Une nouvelle commande a été reçue de <strong>${clientName}</strong>.`}
        </p>
        ${!isPro ? `<p style="color:#555"><strong>Client :</strong> ${clientName}<br/><strong>Email :</strong> ${clientEmail}</p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${itemsHtml}</tbody>
          ${showTotal && !isPro ? `
          <tfoot>
            <tr>
              <td colspan="${isPro ? 1 : 3}" style="padding:10px 12px;text-align:right;font-weight:900;background:#E31E24;color:white">TOTAL TTC</td>
              <td style="padding:10px 12px;text-align:right;font-weight:900;background:#E31E24;color:white">${orderTotal.toFixed(2)} €</td>
            </tr>
          </tfoot>` : ''}
        </table>
      </div>
      <div style="background:#f6f6f6;padding:16px;text-align:center;color:#999;font-size:12px">
        Express Food · contact@expressfood.ma
      </div>
    </div>
  `;

  try {
    const sends = [];

    // ── Email to admin ─────────────────────────────────────────────────────
    sends.push(resend.emails.send({
      from: 'Express Food <simogcloud@gmail.com>',
      to: adminEmail,
      subject: `🛒 Nouvelle commande #EF-${orderRef} — ${isPro ? proClientName : clientName}`,
      html: emailHtml('Admin', true),
    }));

    // ── Email to client ────────────────────────────────────────────────────
    const clientEmailAddress = isPro ? proClientEmail : clientEmail;
    if (clientEmailAddress) {
      sends.push(resend.emails.send({
        from: 'Express Food <simogcloud@gmail.com>',
        to: clientEmailAddress,
        subject: `✅ Votre commande Express Food #EF-${orderRef} est confirmée`,
        html: emailHtml(isPro ? proClientName : clientName, !isPro),
      }));
    }

    await Promise.all(sends);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[Resend] error:', err);
    return res.status(500).json({ error: 'Email error', detail: err?.message });
  }
}