import { useState } from 'react';

export default function EventImage({
  src,
  alt,
  className,
  loading = 'lazy',
}: {
  src?: string | null;
  alt: string;
  className: string;
  loading?: 'eager' | 'lazy';
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!src || failedSource === src) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailedSource(src)}
    />
  );
}
