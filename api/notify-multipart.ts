// api/notify-multipart.ts
// Accepts a multipart/form-data request from the client (payload_json + PDF files)
// and forwards it directly to the Discord webhook — preserving the multipart boundary.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

export const config = {
  api: {
    // Disable Next.js / Vercel body parsing so we can pipe the raw stream
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Collect the raw body chunks
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);

    // Forward to Discord with the same Content-Type (multipart/form-data + boundary)
    const contentType = (req.headers['content-type'] as string) ?? 'multipart/form-data';

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': contentType },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[Discord Webhook] error:', response.status, text);
      return res.status(response.status).json({ error: 'Discord error', detail: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[Discord Webhook] internal error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err?.message });
  }
}