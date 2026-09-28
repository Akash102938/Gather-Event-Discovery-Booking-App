export default function LoadingIndicator({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/50">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
