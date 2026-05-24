import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const filename = req.query.filename as string;
    if (!filename) return res.status(400).json({ error: 'Missing filename' });

    const chunks: Buffer[] = [];
    for await (const chunk of req as any) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Limit to 500KB
    if (buffer.length > 500 * 1024) {
      return res.status(400).json({ error: 'Image too large. Maximum size is 500KB.' });
    }

    const contentType = (req.headers['content-type'] as string) ?? 'image/jpeg';

    const blob = await put(`products/${filename}`, buffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err: any) {
    console.error('[upload-image]', err);
    return res.status(500).json({ error: err.message });
  }
}