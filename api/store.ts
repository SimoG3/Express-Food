import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { key } = req.query;
  if (typeof key !== 'string') return res.status(400).json({ error: 'Missing key' });

  if (req.method === 'GET') {
    const value = await redis.get(key);
    return res.status(200).json(value ?? null);
  }

  if (req.method === 'POST') {
    const { value } = req.body;
    await redis.set(key, JSON.stringify(value));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}