export async function uploadImage(file: File): Promise<string> {
  const MAX_SIZE = 500 * 1024; // 500KB
  if (file.size > MAX_SIZE) {
    throw new Error(`Image trop grande. Maximum 500KB (taille actuelle: ${(file.size / 1024).toFixed(0)}KB)`);
  }

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

  const res = await fetch(`/api/upload-image?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Upload échoué');
  }

  const { url } = await res.json();
  return url; // Returns the public Vercel Blob URL
}