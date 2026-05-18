import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);
    const contentType = (req.headers['content-type'] as string) ?? 'multipart/form-data';

    // ── Pick webhook based on client type ──────────────────────────────────
    const isPro = req.headers['x-is-pro'] === 'true';
    const webhookUrl = isPro
      ? process.env.DISCORD_WEBHOOK_PRO!
      : process.env.DISCORD_WEBHOOK_URL!;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return res.status(response.status).json({ error: 'Discord error', detail: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal error', detail: err?.message });
  }
}