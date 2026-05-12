import type { ImgHTMLAttributes } from 'react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export default function SafeImage({ fallbackText, alt, ...props }: Props) {
  const label   = encodeURIComponent(fallbackText ?? alt ?? 'Product');
  const fallback = `https://placehold.co/300x300/f0f4f8/94a3b8?text=${label}`;

  return (
    <img
      {...props}
      alt={alt ?? fallbackText ?? 'Product'}
      onError={e => {
        const img = e.currentTarget;
        if (img.src !== fallback) img.src = fallback;
      }}
    />
  );
}
